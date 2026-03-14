'use strict';

const { scrapeSite } = require('./scraper');

const URL_HOST = 'https://www.swimmingresults.org';
const URL_PATH = '/individualbest/personal_best.php';

function normalizeAsaNumber(asaNumber) {
    const normalized = String(asaNumber).trim();

    if (!/^\d+$/.test(normalized)) {
        throw new TypeError('ERR: Not a ASA Number');
    }

    return normalized;
}

function buildPersonalBestUrl(asaNumber, year = new Date().getFullYear()) {
    const url = new URL(URL_PATH, URL_HOST);
    url.searchParams.set('targetyear', String(year));
    url.searchParams.set('tiref', normalizeAsaNumber(asaNumber));
    url.searchParams.set('mode', 'A');
    return url.toString();
}

async function getTimes(asaNumber, options = {}) {
    const url = buildPersonalBestUrl(asaNumber, options.year);

    try {
        return await scrapeSite(url, options);
    } catch (error) {
        throw new Error('ERR: Error getting site times: ' + error.message, {
            cause: error
        });
    }
}

module.exports = {
    URL_HOST,
    URL_PATH,
    buildPersonalBestUrl,
    getTimes,
    normalizeAsaNumber
};
