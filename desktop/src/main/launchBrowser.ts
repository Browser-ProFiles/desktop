import os from 'os';
import { BrowserFetcher } from "puppeteer";
import puppeteer from 'puppeteer-extra';
import { FingerprintInjector } from 'fingerprint-injector';
import useProxy from 'puppeteer-page-proxy';
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
  const browserRevision = '1056772';
  const browserDir = `${os.homedir()}/.browsers`;
  const browserProfileDir = `${os.homedir()}/.browserprofiles/${slugify(String(name || Date.now()))}`;

  const browserFetcher = new BrowserFetcher({
    product: 'chrome',
    path: browserDir,
  });

  const revisionInfo = await browserFetcher.download(browserRevision) as any;

  const LAUNCH_OPTIONS = {
    ...profileRow,
    args: [
      ...profileRow.args,
      `--user-data-dir=${browserProfileDir}`,
    ],
    executablePath: revisionInfo.executablePath,
    timeout: 240000 // TODO: Change value
  };

  console.log('LAUNCH_OPTIONS', LAUNCH_OPTIONS)
  const browser = await puppeteer.launch(LAUNCH_OPTIONS);

  const fingerprintInjector = new FingerprintInjector();

  const page = await browser.newPage()
  page.goto('https://google.com');

  const pages = await browser.pages();
  await pages[0].close();

  const proxy = form.proxy;
  const system = form.system;
  const fingerprint = form.fingerprintEnabled ? form.fingerprint : false;

  let proxyUrl: string = '';
  if (proxy?.proxyEnabled) {
    if (proxy.proxyAuthEnabled) {
      proxyUrl = `${proxy.proxyType}://${proxy.proxyUsername}:${proxy.proxyPassword}@${proxy.proxyHost}:${proxy.proxyPort}`;
    } else {
      proxyUrl = `${proxy.proxyType}://${proxy.proxyHost}:${proxy.proxyPort}`;
    }
  }

  for (const page of pages) {
    Object.defineProperty(page.constructor, 'name', { get(): any { return 'CDPPage' }, });
    proxy?.proxyEnabled && await useProxy(page, proxyUrl);

    try {
      system.timezone?.timezone && await page.emulateTimezone(system.timezone?.timezone);
    } catch (e) {
      console.log('emulate timezone error (default)');
    }

    if (fingerprint) {
      try {
        await fingerprintInjector.attachFingerprintToPuppeteer(page, fingerprint);
      } catch (e) {
        console.log('set fingerprint error (default)');
      }
    }
  }

  browser.on('targetcreated', async (target: any) => {
    const page = await target.page();
    if (!page) return;

    Object.defineProperty(page.constructor, 'name', { get(): any { return 'CDPPage' }, });
    proxy?.proxyEnabled && await useProxy(page, proxyUrl);

    try {
      system.timezone?.timezone && await page.emulateTimezone(system.timezone?.timezone);
    } catch (e) {
      console.log('emulate timezone error (new)');
    }

    if (fingerprint) {
      try {
        await fingerprintInjector.attachFingerprintToPuppeteer(page, fingerprint);
      } catch (e) {
        console.log('set fingerprint error (new)');
      }
    }
  });
};
