import path from 'path';
import puppeteer from 'puppeteer-extra';
import useProxy from 'puppeteer-page-proxy';
import { executablePath } from 'puppeteer';
import slugify from 'slugify';

import ChromeAppPlugins from 'puppeteer-extra-plugin-stealth/evasions/chrome.app';
import ChromeCsiPlugins from 'puppeteer-extra-plugin-stealth/evasions/chrome.csi';
import ChromeLoadPluginsPlugins from 'puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes';
import DefaultArgsPlugins from 'puppeteer-extra-plugin-stealth/evasions/defaultArgs';
import NavigatorPlugins from 'puppeteer-extra-plugin-stealth/evasions/navigator.plugins';
import NavigatorWebDriverPlugin from 'puppeteer-extra-plugin-stealth/evasions/navigator.webdriver';
import SourceUrlPlugin from 'puppeteer-extra-plugin-stealth/evasions/sourceurl';
import WindowOuterDimensionsPlugin from 'puppeteer-extra-plugin-stealth/evasions/window.outerdimensions';
// @ts-ignore
import UserDataDirPlugin from 'puppeteer-extra-plugin-user-data-dir';
// const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

puppeteer.use(ChromeAppPlugins());
puppeteer.use(ChromeCsiPlugins());
puppeteer.use(ChromeLoadPluginsPlugins());
puppeteer.use(DefaultArgsPlugins());
puppeteer.use(NavigatorPlugins());
puppeteer.use(NavigatorWebDriverPlugin());
puppeteer.use(SourceUrlPlugin());
puppeteer.use(WindowOuterDimensionsPlugin());
// puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

export const launchBrowser = async (name: string, profileRow: any, form: any) => {
  const chromePath = executablePath();

  const LAUNCH_OPTIONS = {
    ...profileRow,
    args: [
      ...profileRow.args,
      `--user-data-dir=./${slugify(String(name || Date.now()))}`
    ],
    executablePath: chromePath,
  };

  console.log('LAUNCH_OPTIONS', LAUNCH_OPTIONS)
  const browser = await puppeteer.launch(LAUNCH_OPTIONS);

  const page = await browser.newPage()
  page.goto('https://google.com');

  const pages = await browser.pages();
  await pages[0].close();

  const proxy = form.proxy;
  const system = form.system;

  if (proxy?.proxyEnabled) {
    let proxyUrl: string;

    if (proxy.proxyAuthEnabled) {
      proxyUrl = `${proxy.proxyType}://${proxy.proxyUsername}:${proxy.proxyPassword}@${proxy.proxyHost}:${proxy.proxyPort}`;
    } else {
      proxyUrl = `${proxy.proxyType}://${proxy.proxyHost}:${proxy.proxyPort}`;
    }

    const pages = await browser.pages();
    for (const page of pages) {
      Object.defineProperty(page.constructor, 'name', { get(): any { return 'CDPPage' }, });
      await useProxy(page, proxyUrl);
      system.timezone?.timezone && await page.emulateTimezone(system.timezone?.timezone);
    }

    browser.on('targetcreated', async (target: any) => {
      const page = await target.page();
      Object.defineProperty(page.constructor, 'name', { get(): any { return 'CDPPage' }, });
      if (!page) return;

      await useProxy(page, proxyUrl);
      system.timezone?.timezone && await page.emulateTimezone(system.timezone?.timezone);
    });
  }
};
