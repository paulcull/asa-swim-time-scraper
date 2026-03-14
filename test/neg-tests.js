'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { getTimes } = require('../src/index');
const { scrapeSite } = require('../src/scraper');

test('getTimes rejects a non-numeric ASA number', async () => {
    await assert.rejects(
        () => getTimes('NotASANumber'),
        /ERR: Not a ASA Number/
    );
});

test('scrapeSite rejects unexpected hosts', async () => {
    await assert.rejects(
        () => scrapeSite('https://example.com/anything'),
        /ERR: Refusing to scrape an unexpected host/
    );
});

test('scrapeSite rejects non-200 responses', async () => {
    const fetchImpl = async () => new Response('', { status: 503 });

    await assert.rejects(
        () => scrapeSite('https://www.swimmingresults.org/individualbest/personal_best.php', { fetchImpl }),
        /ERR: Invalid status code: 503/
    );
});

test('scrapeSite rejects when no fetch implementation is available', async () => {
    const originalFetch = global.fetch;
    global.fetch = undefined;

    try {
        await assert.rejects(
            () => scrapeSite('https://www.swimmingresults.org/individualbest/personal_best.php'),
            /ERR: No fetch implementation available/
        );
    } finally {
        global.fetch = originalFetch;
    }
});

test('getTimes wraps scraper failures with a public API error', async () => {
    const fetchImpl = async () => {
        throw new Error('network down');
    };

    await assert.rejects(
        () => getTimes('1168208', { fetchImpl }),
        /ERR: Error getting site times: network down/
    );
});
