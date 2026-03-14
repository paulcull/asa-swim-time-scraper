'use strict';

const cheerio = require('cheerio');
const convertTime = require('asa-swim-time-converter').getTime;
const strokes = require('./strokeList').strokeTable;

const TABLE_SELECTOR = 'table#rankTable';
const ALLOWED_HOSTNAME = 'www.swimmingresults.org';
const DEFAULT_TIMEOUT_MS = 10000;

function parseDate(value) {
    const match = /^(\d{2})\/(\d{2})\/(\d{2})$/.exec(String(value).trim());
    if (!match) {
        return null;
    }

    const day = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    const shortYear = Number(match[3]);
    const fullYear = shortYear >= 70 ? 1900 + shortYear : 2000 + shortYear;
    const result = new Date(Date.UTC(fullYear, monthIndex, day));

    return Number.isNaN(result.getTime()) ? null : result;
}

function parseTiming(value) {
    const trimmed = String(value).trim();
    const match = /^(?:(\d+):)?(\d{1,2})\.(\d{1,3})$/.exec(trimmed);

    if (!match) {
        return null;
    }

    const minutes = Number(match[1] || 0);
    const seconds = Number(match[2]);
    const fraction = match[3].padEnd(3, '0');

    return {
        minutes,
        seconds,
        milliseconds: Number(fraction)
    };
}

function toMomentLikeObject(dateValue, timingValue) {
    const date = parseDate(dateValue);
    const timing = parseTiming(timingValue);

    if (!date || !timing) {
        return null;
    }

    return {
        years: date.getUTCFullYear(),
        months: date.getUTCMonth(),
        date: date.getUTCDate(),
        hours: 0,
        minutes: timing.minutes,
        seconds: timing.seconds,
        milliseconds: timing.milliseconds
    };
}

function getCourseMetadata(index) {
    if (index === 0) {
        return {
            course: 'LC',
            convertFrom: '50m',
            convertTo: '25m',
            alternateCourse: 'SC'
        };
    }

    return {
        course: 'SC',
        convertFrom: '25m',
        convertTo: '50m',
        alternateCourse: 'LC'
    };
}

function getStrokeName(value) {
    return strokes[value] || value;
}

function getConvertedResult(stroke, courseMetadata, timing) {
    try {
        return {
            timing: convertTime(stroke, courseMetadata.convertFrom, courseMetadata.convertTo, timing),
            calculated: true
        };
    } catch (error) {
        return {
            timing,
            calculated: false
        };
    }
}

function extractCells($, row) {
    return row.find('th, td').map((_, cell) => {
        return $(cell).text().replace(/\s+/g, ' ').trim();
    }).get();
}

function parseTable($, table, tableIndex, collectedAt) {
    const rows = $(table).find('tr').toArray().map((row) => extractCells($, $(row)));
    if (rows.length === 0) {
        return [];
    }

    const columns = rows[0].length;
    const courseMetadata = getCourseMetadata(tableIndex);
    const swims = [];

    for (let columnIndex = 1; columnIndex < columns; columnIndex += 1) {
        const rawStroke = rows[0][columnIndex];
        if (!rawStroke) {
            continue;
        }

        const stroke = getStrokeName(rawStroke);
        const timing = rows[1] && rows[1][columnIndex] ? rows[1][columnIndex] : '';
        const dateValue = rows[3] && rows[3][columnIndex] ? rows[3][columnIndex] : '';
        const convertedResult = getConvertedResult(stroke, courseMetadata, timing);

        swims.push({
            course: courseMetadata.course,
            stroke,
            dateObtained: parseDate(dateValue),
            timeDate: [{
                course: courseMetadata.course,
                timing,
                dateAndTime: toMomentLikeObject(dateValue, timing),
                calculated: false
            }, {
                course: courseMetadata.alternateCourse,
                timing: convertedResult.timing,
                dateAndTime: toMomentLikeObject(dateValue, convertedResult.timing),
                calculated: convertedResult.calculated
            }],
            finaPts: rows[2] && rows[2][columnIndex] ? rows[2][columnIndex] : '',
            meet: rows[4] && rows[4][columnIndex] ? rows[4][columnIndex] : '',
            venue: rows[5] && rows[5][columnIndex] ? rows[5][columnIndex] : '',
            license: rows[6] && rows[6][columnIndex] ? rows[6][columnIndex] : '',
            level: rows[7] && rows[7][columnIndex] ? rows[7][columnIndex] : '',
            dateCollected: collectedAt
        });
    }

    return swims;
}

function validateUrl(urlValue) {
    const url = new URL(urlValue);

    if (url.protocol !== 'https:' || url.hostname !== ALLOWED_HOSTNAME) {
        throw new Error('ERR: Refusing to scrape an unexpected host');
    }

    return url;
}

async function fetchHtml(url, options) {
    const fetchImpl = options.fetchImpl || global.fetch;

    if (typeof fetchImpl !== 'function') {
        throw new Error('ERR: No fetch implementation available');
    }

    const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
    const response = await fetchImpl(url, {
        headers: {
            'user-agent': 'asa-swim-time-scraper/1.x'
        },
        signal: AbortSignal.timeout(timeoutMs)
    });

    if (!response.ok) {
        throw new Error('ERR: Invalid status code: ' + response.status);
    }

    return response.text();
}

async function scrapeSite(urlValue, options = {}) {
    const url = validateUrl(urlValue);
    const collectedAt = options.now ? new Date(options.now) : new Date();
    const body = await fetchHtml(url, options);
    const $ = cheerio.load(body);
    const tables = $(TABLE_SELECTOR).toArray();

    return tables.flatMap((table, index) => parseTable($, table, index, collectedAt));
}

module.exports = {
    ALLOWED_HOSTNAME,
    DEFAULT_TIMEOUT_MS,
    TABLE_SELECTOR,
    getConvertedResult,
    parseDate,
    parseTable,
    parseTiming,
    scrapeSite,
    toMomentLikeObject,
    validateUrl
};
