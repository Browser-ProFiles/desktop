import path from 'path';
import os from 'os';

import puppeteer from 'puppeteer-extra';
import useProxy from 'puppeteer-page-proxy';
// @ts-ignore
import chromePaths from 'chrome-paths';

import ChromeAppPlugins from 'puppeteer-extra-plugin-stealth/evasions/chrome.app';
import ChromeCsiPlugins from 'puppeteer-extra-plugin-stealth/evasions/chrome.csi';
import ChromeLoadPluginsPlugins from 'puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes';
import DefaultArgsPlugins from 'puppeteer-extra-plugin-stealth/evasions/defaultArgs';
import NavigatorPlugins from 'puppeteer-extra-plugin-stealth/evasions/navigator.plugins';
import NavigatorWebDriverPlugin from 'puppeteer-extra-plugin-stealth/evasions/navigator.webdriver';
import SourceUrlPlugin from 'puppeteer-extra-plugin-stealth/evasions/sourceurl';
import WindowOuterDimensionsPlugin from 'puppeteer-extra-plugin-stealth/evasions/window.outerdimensions';
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

function getChromiumExecPath() {
  return puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked').replace('puppeteer-core', 'puppeteer');
}

export const launchBrowser = async (name: string, profileRow: any, form: any) => {
  const udd = path.resolve(os.homedir(), 'chrome-browser');
  const userDataDir = path.resolve(udd, String(name || Date.now()));

  // console.log('executablePath', chromePaths.chrome)
  const LAUNCH_OPTIONS = {
    ...profileRow,
    executablePath: chromePaths.chrome,
    userDataDir: userDataDir,
    // chromePath
  };

  console.log('LAUNCH_OPTIONS', LAUNCH_OPTIONS)
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
