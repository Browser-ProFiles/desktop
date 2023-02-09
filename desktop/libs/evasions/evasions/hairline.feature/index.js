'use strict'

const { PuppeteerExtraPlugin } = require('puppeteer-extra-plugin')

const withUtils = require('../_utils/withUtils')

/**
 * Fix for the HEADCHR_IFRAME detection (iframe.contentWindow.chrome), hopefully this time without breaking iframes.
 * Note: Only `srcdoc` powered iframes cause issues due to a chromium bug:
 *
 * https://github.com/puppeteer/puppeteer/issues/1106
 */
class Plugin extends PuppeteerExtraPlugin {
  constructor(opts = {}) {
    super(opts)
  }

  get name() {
    return 'stealth/evasions/hairline.feature'
  }

  async onPageCreated(page) {
    console.log('HAIRLINE FEATURE')
    console.log('HAIRLINE FEATURE')
    console.log('HAIRLINE FEATURE')
    console.log('HAIRLINE FEATURE')
    console.log('HAIRLINE FEATURE')
    console.log('HAIRLINE FEATURE')
    console.log('HAIRLINE FEATURE')
    await withUtils(page).evaluateOnNewDocument((utils, opts) => {
      try {
        const elementDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');

        Object.defineProperty(HTMLDivElement.prototype, 'offsetHeight', {
          ...elementDescriptor,
          get: function() {
            if (this.id === 'modernizr') {
              return 1;
            }
            return elementDescriptor.get.apply(this);
          },
        });
      } catch (err) {
        console.warn(err)
      }
    })
  }
}

module.exports = function(pluginConfig) {
  return new Plugin(pluginConfig)
}
