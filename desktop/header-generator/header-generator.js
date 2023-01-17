"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderGenerator = exports.headerGeneratorOptionsShape = void 0;
const tslib_1 = require("tslib");
const generative_bayesian_network_1 = require("generative-bayesian-network");
const ow_1 = tslib_1.__importDefault(require("ow"));
const utils_1 = require("./utils");
const constants_1 = require("./constants");
const inputNetwork = require("./input_network");
const headerNetwork = require("./header_network");
const browserSpecificationShape = {
    name: ow_1.default.string,
    minVersion: ow_1.default.optional.number,
    maxVersion: ow_1.default.optional.number,
    httpVersion: ow_1.default.optional.string,
};
exports.headerGeneratorOptionsShape = {
    browsers: ow_1.default.optional.array.ofType(ow_1.default.any(ow_1.default.object.exactShape(browserSpecificationShape), ow_1.default.string.oneOf(constants_1.SUPPORTED_BROWSERS))),
    operatingSystems: ow_1.default.optional.array.ofType(ow_1.default.string.oneOf(constants_1.SUPPORTED_OPERATING_SYSTEMS)),
    devices: ow_1.default.optional.array.ofType(ow_1.default.string.oneOf(constants_1.SUPPORTED_DEVICES)),
    locales: ow_1.default.optional.array.ofType(ow_1.default.string),
    httpVersion: ow_1.default.optional.string.oneOf(constants_1.SUPPORTED_HTTP_VERSIONS),
    browserListQuery: ow_1.default.optional.string,
};
;
/**
* Randomly generates realistic HTTP headers based on specified options.
*/
class HeaderGenerator {
    /**
    * @param options Default header generation options used - unless overridden.
    */
    constructor(options = {}) {
        Object.defineProperty(this, "globalOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "browserListQuery", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "inputGeneratorNetwork", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "headerGeneratorNetwork", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "uniqueBrowsers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "headersOrder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        (0, ow_1.default)(options, 'HeaderGeneratorOptions', ow_1.default.object.partialShape(exports.headerGeneratorOptionsShape));
        // Use a default setup when the necessary values are not provided
        const { browsers = constants_1.SUPPORTED_BROWSERS, operatingSystems = constants_1.SUPPORTED_OPERATING_SYSTEMS, devices = ['desktop'], locales = ['en-US'], httpVersion = '2', browserListQuery = '', } = options;
        this.globalOptions = {
            browsers: this._prepareBrowsersConfig(browsers, browserListQuery, httpVersion),
            operatingSystems,
            devices,
            locales,
            httpVersion,
            browserListQuery,
        };
        this.uniqueBrowsers = [];
        // TODO (MARK): FIXED
        this.headersOrder = {
          "safari": [
            "cookie",
            "Cookie",
            "Connection",
            "sec-ch-ua",
            "sec-ch-ua-mobile",
            "upgrade-insecure-requests",
            "Upgrade-Insecure-Requests",
            "accept",
            "Accept",
            "accept-encoding",
            "Accept-Encoding",
            "user-agent",
            "User-Agent",
            "accept-language",
            "Accept-Language",
            "referer",
            "Referer",
            "sec-fetch-site",
            "sec-fetch-mode",
            "sec-fetch-user",
            "sec-fetch-dest",
            "Sec-Fetch-Mode",
            "Sec-Fetch-Dest",
            "Sec-Fetch-Site",
            "Sec-Fetch-User",
            "dnt",
            "DNT",
            "te"
          ],
          "chrome": [
            "Connection",
            "sec-ch-ua",
            "sec-ch-ua-mobile",
            "sec-ch-ua-platform",
            "upgrade-insecure-requests",
            "Upgrade-Insecure-Requests",
            "dnt",
            "DNT",
            "user-agent",
            "User-Agent",
            "accept",
            "Accept",
            "sec-fetch-site",
            "sec-fetch-mode",
            "sec-fetch-user",
            "sec-fetch-dest",
            "Sec-Fetch-Mode",
            "Sec-Fetch-Dest",
            "Sec-Fetch-Site",
            "Sec-Fetch-User",
            "referer",
            "Referer",
            "accept-encoding",
            "Accept-Encoding",
            "accept-language",
            "Accept-Language",
            "te",
            "cookie",
            "Cookie"
          ],
          "firefox": [
            "sec-ch-ua",
            "sec-ch-ua-mobile",
            "user-agent",
            "User-Agent",
            "accept",
            "Accept",
            "accept-language",
            "Accept-Language",
            "accept-encoding",
            "Accept-Encoding",
            "dnt",
            "DNT",
            "referer",
            "Referer",
            "cookie",
            "Cookie",
            "Connection",
            "upgrade-insecure-requests",
            "Upgrade-Insecure-Requests",
            "te",
            "sec-fetch-site",
            "sec-fetch-mode",
            "sec-fetch-user",
            "sec-fetch-dest",
            "Sec-Fetch-Mode",
            "Sec-Fetch-Dest",
            "Sec-Fetch-Site",
            "Sec-Fetch-User"
          ],
          "edge": [
            "Connection",
            "sec-ch-ua",
            "sec-ch-ua-mobile",
            "sec-ch-ua-platform",
            "upgrade-insecure-requests",
            "Upgrade-Insecure-Requests",
            "dnt",
            "DNT",
            "user-agent",
            "User-Agent",
            "accept",
            "Accept",
            "sec-fetch-site",
            "sec-fetch-mode",
            "sec-fetch-user",
            "sec-fetch-dest",
            "Sec-Fetch-Mode",
            "Sec-Fetch-Dest",
            "Sec-Fetch-Site",
            "Sec-Fetch-User",
            "referer",
            "Referer",
            "accept-encoding",
            "Accept-Encoding",
            "accept-language",
            "Accept-Language",
            "cookie",
            "Cookie",
            "te"
          ]
        };
        const uniqueBrowserStrings = ["chrome/107.0.0.0|2","chrome/101.0.0.0|2","firefox/88.0|2","firefox/107.0|2","firefox/108.0|2","edge/106.0.1370.61|2","safari/605.1.15|2","firefox/86.0|2","safari/604.1|2","chrome/104.0.0.0|2","chrome/108.0.0.0|2","chrome/106.0.5249.199|2","chrome/95.0.4638.74|2","*MISSING_VALUE*|2","firefox/102.0|2","chrome/107.0.0.0|1","chrome/106.0.0.0|2","edge/107.0.1418.62|2","chrome/93.0.4577.62|2","edge/107.0.1418.62|1","edge/107.0.1418.56|2","chrome/104.0.5112.126|2","chrome/71.0.3578.99|2","edge/107.0.1418.52|2","chrome/80.0.3987.116|2","chrome/105.0.0.0|2","chrome/75.0.3770.142|2","chrome/109.0.0.0|2","firefox/106.0|2","chrome/102.0.0.0|2","chrome/103.0.0.0|2","firefox/99.0|2","chrome/99.0.4844.88|2","edge/105.0.1343.53|1","chrome/102.0.5005.115|2","firefox/109.0|2","firefox/68.0|2","chrome/98.0.4695.0|2","chrome/90.0.4430.212|2","chrome/87.0.4280.101|2","chrome/95.0.4638.69|2","chrome/107.0.5304.141|2","firefox/72.0|2","chrome/98.0.4758.80|2","firefox/101.0|2","chrome/90.0.4430.93|2","chrome/80.0.3987.123|2","chrome/106.0.0.0|1","safari/604.1|1","chrome/106.0.5249.126|2","chrome/99.0.4844.88|1","edge/107.0.1418.26|2","edge/107.0.1418.42|2","chrome/102.0.5005.134|2","chrome/108.0.0.0|1","chrome/107.0.5304.107|2","chrome/107.0.5304.123|2","safari/605.1.15|1","firefox/100.0|2","chrome/100.0.4896.133|2","chrome/99.0.4844.84|2","firefox/97.0|2","firefox/96.0|2","firefox/105.0|2","chrome/78.0.3904.108|2","edge/107.0.1418.35|1","chrome/87.0.4280.141|2","chrome/91.0.4472.114|2","chrome/92.0.4515.107|2","chrome/89.0.4389.82|2","chrome/97.0.4950.0|2","chrome/105.0.0.0|1","chrome/96.0.4664.93|2","chrome/98.0.4758.102|2","chrome/110.0.0.0|2","edge/107.0.1418.43|2","chrome/102.0.5005.125|2","chrome/105.0.5195.52|2","edge/105.0.1343.50|2","chrome/103.0.0.0|1","chrome/106.0.5249.114|2","firefox/103.0|2","chrome/94.0.4606.81|2","chrome/75.0.3770.90|2","chrome/106.0.5249.181|2","chrome/102.0.5005.78|2","edge/105.0.1343.33|2","chrome/97.0.4692.99|2","chrome/99.0.7113.93|2","edge/107.0.1418.56|1","chrome/104.0.5112.124|2","chrome/100.0.4896.127|2","chrome/103.0.5060.53|2","chrome/104.0.5112.102|2","chrome/83.0.4103.106|2","edge/105.0.1343.27|2","chrome/96.0.4664.104|2","chrome/89.0.4389.114|2","firefox/107.0|1","edge/89.0.774.68|2","chrome/94.0.4606.85|2","chrome/80.0.3987.132|2","firefox/95.0|2","safari/8614.2.9.0.10|2","firefox/59.0|2","edge/103.0.1264.77|2","chrome/94.0.4606.71|2","chrome/106.0.5249.168|2","chrome/101.0.4951.41|2","chrome/69.0.3497.100|2","chrome/101.0.4951.15|2","chrome/98.0.4758.136|2","chrome/106.0.5249.126|1","edge/107.0.1418.52|1","chrome/91.0.4472.77|2","chrome/100.0.4896.81|2","chrome/106.0.5249.119|2","chrome/106.0.5249.0|2","chrome/96.0.4664.45|2","chrome/101.0.4951.54|2","chrome/91.0.4472.167|2","chrome/98.0.4758.82|2","chrome/90.0.4430.210|2","firefox/104.0|2","chrome/83.0.4103.116|2","edge/107.0.1418.58|2","chrome/79.0.3945.136|2","chrome/103.0.5060.134|2","chrome/101.0.4951.67|2","chrome/80.0.3987.149|2","chrome/74.0.3729.169|2","chrome/91.0.4472.164|2","chrome/107.0.5304.105|2","chrome/59.0.3071.115|2","chrome/102.0.5005.72|2","chrome/89.0.4389.116|2","chrome/99.0.4844.73|2","chrome/106.0.5125.132|2","chrome/98.0.4758.101|2","edge/100.0.1185.36|2","chrome/99.0.4844.82|2","chrome/99.107.0.0|1","chrome/101.0.4951.63|2","edge/106.0.1370.47|2","chrome/104.0.5112.114|2","chrome/99.0.4844.0|2","chrome/99.0.4844.51|2","edge/106.0.1370.52|2","edge/107.0.1418.35|2"];
        for (const browserString of uniqueBrowserStrings) {
            // There are headers without user agents in the datasets we used to configure the generator. They should be disregarded.
            if (browserString !== constants_1.MISSING_VALUE_DATASET_TOKEN) {
                this.uniqueBrowsers.push(this.prepareHttpBrowserObject(browserString));
            }
        }
        this.inputGeneratorNetwork = new generative_bayesian_network_1.BayesianNetwork(inputNetwork);
        this.headerGeneratorNetwork = new generative_bayesian_network_1.BayesianNetwork(headerNetwork);
    }
    /**
    * Generates a single set of ordered headers using a combination of the default options specified in the constructor
    * and their possible overrides provided here.
    * @param options Specifies options that should be overridden for this one call.
    * @param requestDependentHeaders Specifies known values of headers dependent on the particular request.
    */
    getHeaders(options = {}, requestDependentHeaders = {}, userAgentValues) {
        (0, ow_1.default)(options, 'HeaderGeneratorOptions', ow_1.default.object.partialShape(exports.headerGeneratorOptionsShape));
        const headerOptions = { ...this.globalOptions, ...options };
        const possibleAttributeValues = this._getPossibleAttributeValues(headerOptions);
        const [http1Values, http2Values] = userAgentValues ? [
            generative_bayesian_network_1.utils.getPossibleValues(this.headerGeneratorNetwork, { 'User-Agent': userAgentValues }),
            generative_bayesian_network_1.utils.getPossibleValues(this.headerGeneratorNetwork, { 'user-agent': userAgentValues }),
        ] : [null, null];
        // Generate a sample of input attributes consistent with the data used to create the definition files if possible.
        const inputSample = this.inputGeneratorNetwork.generateConsistentSampleWhenPossible(Object.entries(possibleAttributeValues).reduce((acc, [key, value]) => {
            if (key === '*BROWSER_HTTP') {
                acc[key] = value.filter((x) => {
                    const [browserName, httpVersion] = x.split('|');
                    return (httpVersion === '1' ? http1Values : http2Values)?.['*BROWSER'].includes(browserName) ?? true;
                });
                return acc;
            }
            acc[key] = value.filter((x) => (http1Values?.[key]?.includes(x) || http2Values?.[key]?.includes(x)) ?? true);
            return acc;
        }, {}));
        if (Object.keys(inputSample).length === 0) {
            // Try to convert HTTP/2 headers to HTTP/1 headers
            if (headerOptions.httpVersion === '1') {
                const headers2 = this.getHeaders({
                    ...options,
                    httpVersion: '2',
                }, requestDependentHeaders, userAgentValues);
                const pascalize = (name) => {
                    return name.split('-').map((part) => {
                        return part[0].toUpperCase() + part.slice(1).toLowerCase();
                    }).join('-');
                };
                const converted2to1 = Object.fromEntries(Object.entries(headers2).map(([name, value]) => {
                    if (name.startsWith('sec-ch-ua')) {
                        return [name, value];
                    }
                    if (['dnt', 'rtt', 'ect'].includes(name)) {
                        return [name.toUpperCase(), value];
                    }
                    return [pascalize(name), value];
                }));
                return this.orderHeaders(converted2to1);
            }
            throw new Error('No headers based on this input can be generated. Please relax or change some of the requirements you specified.');
        }
        // Generate the actual headers
        const generatedSample = this.headerGeneratorNetwork.generateSample(inputSample);
        // Manually fill the accept-language header with random ordering of the locales from input
        const generatedHttpAndBrowser = this.prepareHttpBrowserObject(generatedSample[constants_1.BROWSER_HTTP_NODE_NAME]);
        let secFetchAttributeNames = constants_1.HTTP2_SEC_FETCH_ATTRIBUTES;
        let acceptLanguageFieldName = 'accept-language';
        if (generatedHttpAndBrowser.httpVersion !== '2') {
            acceptLanguageFieldName = 'Accept-Language';
            secFetchAttributeNames = constants_1.HTTP1_SEC_FETCH_ATTRIBUTES;
        }
        generatedSample[acceptLanguageFieldName] = this._getAcceptLanguageField(headerOptions.locales);
        const isChrome = generatedHttpAndBrowser.name === 'chrome';
        const isFirefox = generatedHttpAndBrowser.name === 'firefox';
        const isEdge = generatedHttpAndBrowser.name === 'edge';
        const hasSecFetch = (isChrome && generatedHttpAndBrowser.version[0] >= 76)
            || (isFirefox && generatedHttpAndBrowser.version[0] >= 90)
            || (isEdge && generatedHttpAndBrowser.version[0] >= 79);
        // Add fixed headers if needed
        if (hasSecFetch) {
            generatedSample[secFetchAttributeNames.site] = 'same-site';
            generatedSample[secFetchAttributeNames.mode] = 'navigate';
            generatedSample[secFetchAttributeNames.user] = '?1';
            generatedSample[secFetchAttributeNames.dest] = 'document';
        }
        for (const attribute of Object.keys(generatedSample)) {
            if (attribute.startsWith('*') || generatedSample[attribute] === constants_1.MISSING_VALUE_DATASET_TOKEN)
                delete generatedSample[attribute];
        }
        // Order the headers in an order depending on the browser
        return this.orderHeaders({
            ...generatedSample,
            ...requestDependentHeaders,
        }, this.headersOrder[generatedHttpAndBrowser.name]);
    }
    /**
    * Returns a new object that contains ordered headers.
    * @param headers Specifies known values of headers dependent on the particular request.
    * @param order An array of ordered header names, optional (will be deducted from `user-agent`).
    */
    orderHeaders(headers, order = this.getOrderFromUserAgent(headers)) {
        const orderedSample = {};
        for (const attribute of order) {
            if (attribute in headers) {
                orderedSample[attribute] = headers[attribute];
            }
        }
        for (const attribute of Object.keys(headers)) {
            if (!order.includes(attribute)) {
                orderedSample[attribute] = headers[attribute];
            }
        }
        return orderedSample;
    }
    _prepareBrowsersConfig(browsers, browserListQuery, httpVersion) {
        let finalBrowsers = browsers;
        if (browserListQuery) {
            finalBrowsers = (0, utils_1.getBrowsersFromQuery)(browserListQuery);
        }
        return finalBrowsers.map((browser) => {
            if (typeof browser === 'string') {
                return { name: browser, httpVersion };
            }
            browser.httpVersion = httpVersion;
            return browser;
        });
    }
    _getBrowserHttpOptions(browsers) {
        const browserHttpOptions = [];
        for (const browser of browsers) {
            for (const browserOption of this.uniqueBrowsers) {
                if (browser.name === browserOption.name) {
                    if ((!browser.minVersion || this._browserVersionIsLesserOrEquals([browser.minVersion], browserOption.version))
                        && (!browser.maxVersion || this._browserVersionIsLesserOrEquals(browserOption.version, [browser.maxVersion]))
                        && browser.httpVersion === browserOption.httpVersion) {
                        browserHttpOptions.push(browserOption.completeString);
                    }
                }
            }
        }
        return browserHttpOptions;
    }
    _getPossibleAttributeValues(headerOptions) {
        const { browsers: optionsBrowser, browserListQuery, httpVersion, operatingSystems } = headerOptions;
        const browsers = this._prepareBrowsersConfig(optionsBrowser, browserListQuery, httpVersion);
        // Find known browsers compatible with the input
        const browserHttpOptions = this._getBrowserHttpOptions(browsers);
        const possibleAttributeValues = {};
        possibleAttributeValues[constants_1.BROWSER_HTTP_NODE_NAME] = browserHttpOptions;
        possibleAttributeValues[constants_1.OPERATING_SYSTEM_NODE_NAME] = operatingSystems;
        if (headerOptions.devices) {
            possibleAttributeValues[constants_1.DEVICE_NODE_NAME] = headerOptions.devices;
        }
        return possibleAttributeValues;
    }
    _getAcceptLanguageField(localesFromOptions) {
        let locales = localesFromOptions;
        let highLevelLocales = [];
        for (const locale of locales) {
            if (!locale.includes('-')) {
                highLevelLocales.push(locale);
            }
        }
        for (const locale of locales) {
            if (!highLevelLocales.includes(locale)) {
                let highLevelEquivalentPresent = false;
                for (const highLevelLocale of highLevelLocales) {
                    if (locale.includes(highLevelLocale)) {
                        highLevelEquivalentPresent = true;
                        break;
                    }
                }
                if (!highLevelEquivalentPresent)
                    highLevelLocales.push(locale);
            }
        }
        highLevelLocales = (0, utils_1.shuffleArray)(highLevelLocales);
        locales = (0, utils_1.shuffleArray)(locales);
        const localesInAddingOrder = [];
        for (const highLevelLocale of highLevelLocales) {
            for (const locale of locales) {
                if (locale.includes(highLevelLocale) && !highLevelLocales.includes(locale)) {
                    localesInAddingOrder.push(locale);
                }
            }
            localesInAddingOrder.push(highLevelLocale);
        }
        let acceptLanguageFieldValue = localesInAddingOrder[0];
        for (let x = 1; x < localesInAddingOrder.length; x++) {
            acceptLanguageFieldValue += `,${localesInAddingOrder[x]};q=${1 - x * 0.1}`;
        }
        return acceptLanguageFieldValue;
    }
    /**
    * Extract structured information about a browser and http version in the form of an object from httpBrowserString.
    * @param httpBrowserString A string containing the browser name, version and http version, such as `chrome/88.0.4324.182|2`.
    */
    prepareHttpBrowserObject(httpBrowserString) {
        const [browserString, httpVersion] = httpBrowserString.split('|');
        let browserObject;
        if (browserString === constants_1.MISSING_VALUE_DATASET_TOKEN) {
            browserObject = { name: constants_1.MISSING_VALUE_DATASET_TOKEN };
        }
        else {
            browserObject = this.prepareBrowserObject(browserString);
        }
        return {
            ...browserObject,
            httpVersion: httpVersion,
            completeString: httpBrowserString,
        };
    }
    /**
     * Extract structured information about a browser in the form of an object from browserString.
     * @param browserString A string containing the browser name and version, e.g. `chrome/88.0.4324.182`.
     */
    prepareBrowserObject(browserString) {
        const nameVersionSplit = browserString.split('/');
        const versionSplit = nameVersionSplit[1].split('.');
        const preparedVersion = [];
        for (const versionPart of versionSplit) {
            preparedVersion.push(parseInt(versionPart, 10));
        }
        return {
            name: nameVersionSplit[0],
            version: preparedVersion,
            completeString: browserString,
        };
    }
    /**
     * Returns a new object containing header names ordered by their appearance in the given browser.
     * @param headers Non-normalized request headers
     * @returns Correct header order for the given browser.
     */
    getOrderFromUserAgent(headers) {
        const userAgent = (0, utils_1.getUserAgent)(headers);
        const browser = (0, utils_1.getBrowser)(userAgent);
        if (!browser) {
            return [];
        }
        return this.headersOrder[browser];
    }
    _browserVersionIsLesserOrEquals(browserVersionL, browserVersionR) {
        return browserVersionL[0] <= browserVersionR[0];
    }
}
exports.HeaderGenerator = HeaderGenerator;
//# sourceMappingURL=header-generator.js.map
