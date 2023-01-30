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

import { decodeHash } from '../helpers/hash';
import { removeNullBytes } from '../helpers/str';
import { getAutoOpenLinks } from '../helpers/openLinks';
import { pageWithCDPSession } from '../helpers/pageWrap';

puppeteer.use(ChromeAppPlugins());
puppeteer.use(ChromeCsiPlugins());
puppeteer.use(ChromeLoadPluginsPlugins());
puppeteer.use(DefaultArgsPlugins());
puppeteer.use(NavigatorPlugins());
puppeteer.use(NavigatorWebDriverPlugin());
puppeteer.use(SourceUrlPlugin());
puppeteer.use(WindowOuterDimensionsPlugin());
// puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

export const launchBrowser = async (
  name: string,
  profileRow: any,
  form: any,
  browserHash: string,
  userHash: string,
) => {
  const browserDir = `${os.homedir()}/.browserprofiles/browsers`;
  const browserProfileDir = `${os.homedir()}/.browserprofiles/profiles/${slugify(String(name || Date.now()))}`;

  const browserFetcher = new BrowserFetcher({
    product: 'chrome',
    path: browserDir,
  });

  const revision = removeNullBytes(decodeHash(browserHash, userHash));
  const revisionInfo = await browserFetcher.revisionInfo(revision) as any;

  const LAUNCH_OPTIONS = {
    ...profileRow,
    args: [
      ...profileRow.args,
      `--user-data-dir=${browserProfileDir}`,
      '--disable-site-isolation-xtrials',
      "--disable-features=IsolateOrigins",
      '--disable-web-security',
      // '--host-resolver-rules=MAP example.com 1.1.1.1'
    ],
    executablePath: revisionInfo.executablePath,
    timeout: 60 * 100000  // 1m
  };

  const browser = await puppeteer.launch(LAUNCH_OPTIONS);

  const fingerprintInjector = new FingerprintInjector();

  const page = await browser.newPage();
  pageWithCDPSession(page);
  try {
    page.goto('about:blank');
  } catch (e) {
    console.log('new page error');
  }

  const pages = await browser.pages();
  await pages[0].close();

  const proxy = form.proxy;
  const system = form.system;

  let fingerprint: any = null;
  if (form.fingerprint?.fingerprintEnabled && form.fingerprint?.fingerprintResult) {
    try {
      fingerprint = JSON.parse(form.fingerprint?.fingerprintResult);
    } catch (e) {
      fingerprint = form.fingerprint?.fingerprintResult;
    }
    // fingerprint.headers['accept-language'] = 'en';
  }

  let proxyUrl: string = '';
  if (proxy?.proxyEnabled) {
    if (proxy.proxyAuthEnabled) {
      proxyUrl = `${proxy.proxyType}://${proxy.proxyUsername}:${proxy.proxyPassword}@${proxy.proxyHost}:${proxy.proxyPort}`;
    } else {
      proxyUrl = `${proxy.proxyType}://${proxy.proxyHost}:${proxy.proxyPort}`;
    }
  }

  for (const page of pages) {
    if (!page) return;

    pageWithCDPSession(page);

    try {
      form.fingerprint.hideWebRtcLeak && await page.evaluateOnNewDocument(
        `navigator.mediaDevices.getUserMedia = navigator.webkitGetUserMedia = navigator.mozGetUserMedia = navigator.getUserMedia = webkitRTCPeerConnection = RTCPeerConnection = MediaStreamTrack = undefined;`
      );
    } catch (e) {
      console.error('webrtc leak hide error (default)');
    }

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

    pageWithCDPSession(page);

    try {
      form.fingerprint.hideWebRtcLeak && await page.evaluateOnNewDocument(
        `navigator.mediaDevices.getUserMedia = navigator.webkitGetUserMedia = navigator.mozGetUserMedia = navigator.getUserMedia = webkitRTCPeerConnection = RTCPeerConnection = MediaStreamTrack = undefined;`
      );
    } catch (e) {
      console.error('webrtc leak hide error (new)');
    }

    Object.defineProperty(page.constructor, 'name', { get(): any { return 'CDPPage' }, });
    proxy?.proxyEnabled && await useProxy(page, proxyUrl);

    try {
      system.timezone?.timezone && await page.emulateTimezone(system.timezone?.timezone);
    } catch (e) {
      console.error('emulate timezone error (new)');
    }

    if (fingerprint) {
      try {
        await fingerprintInjector.attachFingerprintToPuppeteer(page, fingerprint);
      } catch (e) {
        console.error('set fingerprint error (new)', e);
      }
    }
  });

  try {
    const openCheckersKeys: string[] = [];
    Object.entries(form.checkers).map(([ key, value ]) => value && openCheckersKeys.push(key));
    const links = getAutoOpenLinks(openCheckersKeys);

    links.forEach(async (link) => {
      const page = await browser.newPage();
      pageWithCDPSession(page);
      page.goto(link);
    });
  } catch (e) {
    console.error('open checkers error', e)
  }
};
