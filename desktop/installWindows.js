const { downloadBrowser } = require('puppeteer/internal/node/install.js');
const mock = require('mock-os');
const os = require('os');

mock({
  version: '10.0.18363',
  platform: 'win32',
});

console.log('OS PLATFORM INSTALLED AS:', os.platform());
console.log('OS VERSION INSTALLED AS:', os.version());

downloadBrowser();
