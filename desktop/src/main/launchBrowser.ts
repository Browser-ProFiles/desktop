import path from 'path';
import os from 'os';

import puppeteer from 'puppeteer-extra';
import useProxy from 'puppeteer-page-proxy';
// @ts-ignore
import PCR from 'puppeteer-chromium-resolver';
import { executablePath } from 'puppeteer';

import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

puppeteer.use(StealthPlugin());
// puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

export const launchBrowser = async (name: string, profileRow: any, form: any) => {
  const udd = path.resolve(os.homedir(), 'chrome-browser');
  const userDataDir = path.resolve(udd, String(name || Date.now()));
  const stats = await PCR();

  console.log('stats.executablePath', stats.executablePath)
  const LAUNCH_OPTIONS = {
    ...profileRow,
    executablePath: stats.executablePath,
    userDataDir: userDataDir,
    // chromePath
  };

  const browser = await puppeteer.launch(LAUNCH_OPTIONS);

  const page = await browser.newPage()
  page.goto('https://google.com');

  const pages = await browser.pages();
  await pages[0].close();

  const proxy = form.proxy;

  if (proxy?.proxyEnabled) {
    let proxyUrl: string;

    if (proxy.proxyAuthEnabled) {
      proxyUrl = `${proxy.proxyType}://${proxy.proxyUsername}:${proxy.proxyPassword}@${proxy.proxyHost}:${proxy.proxyPort}`;
    } else {
      proxyUrl = `${proxy.proxyType}://${proxy.proxyHost}:${proxy.proxyPort}`;
    }

    const pages = await browser.pages();
    for (const page of pages) {
      await useProxy(page, proxyUrl);
    }

    browser.on('targetcreated', async (target: any) => {
      const page = await target.page();
      if (!page) return;

      await useProxy(page, proxyUrl);
    });
  }
};
