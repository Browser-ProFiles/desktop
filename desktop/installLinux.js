const { downloadBrowser } = require('puppeteer/internal/node/install.js');
const mock = require('mock-os');
const os = require('os');

mock({
  platform: 'linux',
});

console.log('OS VERSION INSTALLED AS:', os.version());

downloadBrowser();

