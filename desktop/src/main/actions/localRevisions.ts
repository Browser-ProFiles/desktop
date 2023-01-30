import os from 'os';
import { BrowserFetcher } from 'puppeteer';
import { encodeHash } from '../helpers/hash';

export const getLocalRevisions = (userHash: string) => {
  const browserDir = `${os.homedir()}/.browserprofiles/browsers`;

  const browserFetcher = new BrowserFetcher({
    product: 'chrome',
    path: browserDir,
  });

  const revisions = browserFetcher.localRevisions();

  return revisions.map((revision) => ({
    revision,
    hash: encodeHash(revision, userHash),
  }));
};
