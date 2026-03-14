'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');

const { buildPersonalBestUrl, getTimes, normalizeAsaNumber } = require('../src/index');
const {
    getConvertedResult,
    parseDate,
    parseTable,
    parseTiming,
    scrapeSite,
    toMomentLikeObject
} = require('../src/scraper');

const fixturePath = path.join(__dirname, 'fixtures', 'personal-best.html');
const personalBestHtml = fs.readFileSync(fixturePath, 'utf8');

function createFetchImpl(html = personalBestHtml) {
    return async () => new Response(html, {
        status: 200,
        headers: {
            'content-type': 'text/html'
        }
    });
}

test('normalizeAsaNumber trims surrounding whitespace', () => {
    assert.equal(normalizeAsaNumber(' 001168208 '), '001168208');
});

test('buildPersonalBestUrl assembles the expected swimmingresults.org URL', () => {
    assert.equal(
        buildPersonalBestUrl('1168208', 2026),
        'https://www.swimmingresults.org/individualbest/personal_best.php?targetyear=2026&tiref=1168208&mode=A'
    );
});

test('parse helpers convert dates and timings into structured values', () => {
    assert.deepEqual(parseTiming('1:02.34'), {
        minutes: 1,
        seconds: 2,
        milliseconds: 340
    });
    assert.equal(parseDate('15/02/24').toISOString(), '2024-02-15T00:00:00.000Z');
    assert.deepEqual(toMomentLikeObject('15/02/24', '1:02.34'), {
        years: 2024,
        months: 1,
        date: 15,
        hours: 0,
        minutes: 1,
        seconds: 2,
        milliseconds: 340
    });
    assert.equal(parseDate('not-a-date'), null);
    assert.equal(parseTiming('not-a-time'), null);
    assert.equal(toMomentLikeObject('15/02/24', 'bad'), null);
});

test('scrapeSite parses long-course and short-course tables from fixture HTML', async () => {
    const now = '2026-03-14T12:00:00.000Z';
    const swims = await scrapeSite(
        'https://www.swimmingresults.org/individualbest/personal_best.php?targetyear=2026&tiref=1168208&mode=A',
        {
            fetchImpl: createFetchImpl(),
            now
        }
    );

    assert.equal(swims.length, 4);
    assert.deepEqual(
        swims.map((swim) => ({
            course: swim.course,
            stroke: swim.stroke,
            timing: swim.timeDate[0].timing
        })),
        [
            { course: 'LC', stroke: '50 Free', timing: '0:25.16' },
            { course: 'LC', stroke: '100 IM', timing: '1:02.34' },
            { course: 'SC', stroke: '50 Back', timing: '0:28.11' },
            { course: 'SC', stroke: '200 IM', timing: '2:14.99' }
        ]
    );
    assert.equal(swims[0].dateCollected.toISOString(), now);
    assert.equal(swims[0].dateObtained.toISOString(), '2024-02-15T00:00:00.000Z');
    assert.equal(swims[1].timeDate[1].calculated, false);
    assert.equal(swims[1].timeDate[1].timing, '1:02.34');
});

test('getTimes delegates to scrapeSite and preserves parsed swim data', async () => {
    const swims = await getTimes('1168208', {
        year: 2026,
        now: '2026-03-14T12:00:00.000Z',
        fetchImpl: createFetchImpl()
    });

    assert.equal(swims[0].meet, 'County Championships');
    assert.equal(swims[2].venue, 'Leeds');
});

test('getConvertedResult falls back safely when converter does not support a stroke', () => {
    assert.deepEqual(
        getConvertedResult('100 IM', { convertFrom: '50m', convertTo: '25m' }, '1:02.34'),
        {
            timing: '1:02.34',
            calculated: false
        }
    );
});

test('parseTable handles empty tables and blank stroke columns', () => {
    const emptyDoc = cheerio.load('<table id="rankTable"></table>');
    assert.deepEqual(parseTable(emptyDoc, emptyDoc('table').get(0), 0, new Date('2026-03-14T00:00:00.000Z')), []);

    const partialDoc = cheerio.load(`
        <table id="rankTable">
          <tr><th>Event</th><th></th><th>50 Freestyle</th></tr>
          <tr><td>Time</td><td></td><td>0:25.16</td></tr>
          <tr><td>FINA Pts</td><td></td><td>650</td></tr>
          <tr><td>Date</td><td></td><td>15/02/24</td></tr>
        </table>
    `);

    const swims = parseTable(partialDoc, partialDoc('table').get(0), 0, new Date('2026-03-14T00:00:00.000Z'));
    assert.equal(swims.length, 1);
    assert.equal(swims[0].stroke, '50 Free');
    assert.equal(swims[0].meet, '');
});
