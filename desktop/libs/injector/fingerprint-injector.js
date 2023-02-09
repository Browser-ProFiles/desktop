"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FingerprintInjector = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = require("fs");
const constants_1 = require("./constants");

class FingerprintInjector {
    constructor() {
        Object.defineProperty(this, "utilsJs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this._loadUtils()
        });
    }
    /**
     * TODO: MAIN ENTRY
     * Adds script that is evaluated before every document creation.
     * Sets User-Agent and viewport using native puppeteer interface
     * @param page Puppeteer `Page` object to be injected with the fingerprint.
     * @param fingerprint Fingerprint from [`fingerprint-generator`](https://github.com/apify/fingerprint-generator).
     */
    async attachFingerprintToPuppeteer(page, browserFingerprintWithHeaders) {
        const { fingerprint, headers } = browserFingerprintWithHeaders;
        const enhancedFingerprint = this._enhanceFingerprint(fingerprint);
        const { screen, userAgent } = enhancedFingerprint;
        await page.setUserAgent(userAgent);

        // TODO (MARK): Commented
        /*await (await page.target().createCDPSession()).send('Page.setDeviceMetricsOverride', {
            screenHeight: screen.height,
            screenWidth: screen.width,
            width: screen.width,
            height: screen.height,
            mobile: !!(/phone|android|mobile/.test(userAgent)),
            // screenOrientation: screen.height > screen.width ? { angle: 0, type: 'portraitPrimary' } : { angle: 90, type: 'landscapePrimary' },
            deviceScaleFactor: screen.devicePixelRatio,
        });*/

        // Override the language properly
        await page.setExtraHTTPHeaders({
            'accept-language': headers['accept-language'],
        });
        await page.emulateMediaFeatures([
            { name: 'prefers-color-scheme', value: 'dark' },
        ]);

        // TODO: Finish
        const readyScript = `
          ${this.getInjectableFingerprintFunction(enhancedFingerprint)}
        `;
        /*this.getInjectableWorkerScript(enhancedFingerprint)*/

        await page.evaluateOnNewDocument(readyScript);
    }
    /**
     * Gets the override script that should be evaluated in the browser.
     */
    getInjectableScript(browserFingerprintWithHeaders) {
        const { fingerprint } = browserFingerprintWithHeaders;
        const enhancedFingerprint = this._enhanceFingerprint(fingerprint);
        return this.getInjectableFingerprintFunction(enhancedFingerprint);
    }

  /**
   * @experimental
   * @returns
   */
  getInjectableWorkerScript(fingerprint) {
    const enhancedFingerprint = this._enhanceFingerprint(fingerprint);

    return this._getInjectableNavigatorFingerprintFunction(enhancedFingerprint);
  }

  /**
   * Gets the override script that should be evaluated in the browser.
   * TODO: Copied from draft. Should work
   * @see https://github.com/apify/fingerprint-suite/pull/105/files
   * @experimental
   */
  _getInjectableNavigatorFingerprintFunction(fingerprint) {
    function inject() {
      const {
        battery,
        navigator: {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          extraProperties,
          userAgentData,
          webdriver,
          ...navigatorProps
        },
        videoCard,
        // @ts-expect-error internal browser code
      } = fpWorker;

      if (userAgentData) {
        overrideUserAgentData(userAgentData);
      }

      overrideInstancePrototype(navigator, navigatorProps);

      overrideWebGl(videoCard);
      overrideBattery(battery);
    }

    const mainFunctionString = inject.toString();

    return `(()=>{${this.utilsJs}; const fpWorker=${JSON.stringify(fingerprint)}; (${mainFunctionString})()})()`;
  }

  /**
     * Create injection function string.
     * @param fingerprint Enhanced fingerprint.
     * @returns Script overriding browser fingerprint.
     */
    getInjectableFingerprintFunction(fingerprint) {
        function inject() {
            const { battery, navigator: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            extraProperties, userAgentData, webdriver, ...navigatorProps }, screen: allScreenProps, videoCard, historyLength, audioCodecs, videoCodecs,
            // @ts-expect-error internal browser code
             } = fp;
            const {
            // window screen props
            outerHeight, outerWidth, devicePixelRatio, innerWidth, innerHeight, screenX, pageXOffset, pageYOffset,
            // Document screen props
            clientWidth, clientHeight,
            // Ignore hdr for now.
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            hasHDR,
            // window.screen props
            ...newScreen } = allScreenProps;
            const windowScreenProps = {
                innerHeight,
                outerHeight,
                outerWidth,
                innerWidth,
                screenX,
                pageXOffset,
                pageYOffset,
                devicePixelRatio,
            };
            const documentScreenProps = {
                clientHeight,
                clientWidth,
            };
            runHeadlessFixes();
            overrideIntlAPI(navigatorProps.language);
            overrideStatic();
            if (userAgentData) {
                overrideUserAgentData(userAgentData);
            }
            if (window.navigator.webdriver) {
                navigatorProps.webdriver = false;
            }
            // TODO: Fix
            navigatorProps.hardwareConcurrency = window.navigator.hardwareConcurrency;
            navigatorProps.deviceMemory = window.navigator.deviceMemory;

            overrideInstancePrototype(window.navigator, navigatorProps);
            // overrideInstancePrototype(window.screen, newScreen);
            // overrideWindowDimensionsProps(windowScreenProps);
            // overrideDocumentDimensionsProps(documentScreenProps);
            overrideInstancePrototype(window.history, { length: historyLength });
            overrideWebGl(videoCard);
            overrideCodecs(audioCodecs, videoCodecs);
            overrideBattery(battery);
        }
        const mainFunctionString = inject.toString();
        return `(()=>{${this.utilsJs}; const fp=${JSON.stringify(fingerprint)}; (${mainFunctionString})()})()`;
    }

    _enhanceFingerprint(fingerprint) {
        const { navigator, ...rest } = fingerprint;
        return {
            ...rest,
            navigator,
            userAgent: navigator.userAgent,
            historyLength: this._randomInRange(2, 6),
        };
    }

    _loadUtils() {
        const utilsJs = (0, fs_1.readFileSync)(path_1.default.join(__dirname, constants_1.UTILS_FILE_NAME));
        // we need to add the new lines because of typescript initial a final comment causing issues.
        return `\n${utilsJs}\n`;
    }

    _randomInRange(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }
    ;
}
exports.FingerprintInjector = FingerprintInjector;
//# sourceMappingURL=fingerprint-injector.js.map
