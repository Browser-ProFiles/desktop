import os from 'os';
import { BrowserFetcher } from 'puppeteer';

import { decodeHash } from '../helpers/hash';
import { removeNullBytes } from '../helpers/str';

export const downloadBrowser = async (
  userHash: string,
  browserHash: string,
  progressCallback = (x: number, y: number) => {},
) => {
  const browserDir = `${os.homedir()}/.browserprofiles/browsers`;

  const browserFetcher = new BrowserFetcher({
    product: 'chrome',
    path: browserDir,
  });

  const revision = removeNullBytes(decodeHash(browserHash, userHash));
  if (!await browserFetcher.canDownload(revision)) {
    throw new Error('Can\'t download browser.');
  }
  return await browserFetcher.download(revision, progressCallback) as any;
};
