const got = require("got");
const CookieHandler = require("../lib/cookies");
const {setHeaders, setAgent} = require("../lib/options");
const type = require("../util/types");

// Responsible for applying proxy
const requestHandler = async (request, proxy, overrides = {}) => {
    // Reject non http(s) URI schemes
    if (!request.url().startsWith("http") && !request.url().startsWith("https")) {
        request.continue(); return;
    }
    const cookieHandler = new CookieHandler(request);
    // Request options for GOT accounting for overrides
    const options = {
        cookieJar: await cookieHandler.getCookies(),
        method: overrides.method || request.method(),
        body: overrides.postData || request.postData(),
        headers: overrides.headers || setHeaders(request),
        agent: setAgent(proxy),
        responseType: "buffer",
        maxRedirects: 15,
        throwHttpErrors: false,
        ignoreInvalidCookies: true,
        followRedirect: false
    };
    try {
      console.log('URL', overrides.url || request.url(), (overrides.url || request.url()) === 'https://medaipvx.com/' ? options : 'empty options');
        const response = await got(overrides.url || request.url(), options);
        // Set cookies manually because "set-cookie" doesn't set all cookies (?)
        // Perhaps related to https://github.com/puppeteer/puppeteer/issues/5364
        const setCookieHeader = response.headers["set-cookie"];
        if (setCookieHeader) {
            await cookieHandler.setCookies(setCookieHeader);
            response.headers["set-cookie"] = undefined;
        }
        const config = {
          status: response.statusCode,
          headers: {
            ...response.headers,
            // TODO: Change?
            /*"access-control-allow-origin": "*",
            "access-control-allow-credentials": 'true',
            "access-control-allow-methods": "*",
            "accept-language": "en;q=0.8",
            "sec-fetch-site": "cross-site"*/
          },
          body: response.body
        }
        // console.log('config', config)
        await request.respond(config);
    } catch (error) {
        await request.abort();
    }
};

// For reassigning proxy of page
const removeRequestListener = (page, listenerName) => {
    const eventName = "request";
    const listeners = page.eventsMap.get(eventName);
    if (listeners) {
        const i = listeners.findIndex((listener) => {
            return listener.name === listenerName
        });
        listeners.splice(i, 1);
        if (!listeners.length) {
            page.eventsMap.delete(eventName);
        }
    }
};

const useProxyPer = {
    // Call this if request object passed
    HTTPRequest: async (request, data) => {
        let proxy, overrides;
        // Separate proxy and overrides
        if (type(data) === "object") {
            if (Object.keys(data).length !== 0) {
                proxy = data.proxy;
                delete data.proxy;
                overrides = data;
            }
        } else {proxy = data}
        // Skip request if proxy omitted
        if (proxy) {await requestHandler(request, proxy, overrides)}
        else {request.continue(overrides)}
    },

    // Call this if page object passed
    CDPPage: async (page, proxy) => {
        await page.setRequestInterception(true);
        const listener = "$ppp_requestListener";
        removeRequestListener(page, listener);
        const f = {[listener]: async (request) => {
            await requestHandler(request, proxy);
        }};
        if (proxy) {page.on("request", f[listener])}
        else {await page.setRequestInterception(false)}
    }
}

// Main function
const useProxy = async (target, data) => {
    useProxyPer[target.constructor.name](target, data);
};

module.exports = useProxy;
