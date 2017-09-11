(function() {
    'use strict';

    var cheerio = require('cheerio');
    var ctp = require('cheerio-tableparser');
    var request = require('request');
    var strokes = require('./strokeList').strokeTable;
    // var inspect = require('eyes').inspector({ maxLength: false });
    // var _ = require('underscore');
    var moment = require('moment');
    var convertTime = require('asa-swim-time-converter').getTime;

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    var TableTag = 'table#rankTable';

    var scraper = {

        scrapeSite: function scrapeSite(url) {
            // exports.scrapeSite = function(url) {
            return new Promise(function(resolve, reject) {
                request(url, function(err, response, body) {
                    if (err) { reject(err); }
                    if (response.statusCode !== 200) {
                        reject('Invalid status code: ' + response.statusCode);
                    }
                    var $ = cheerio.load(body);
                    var swimLists = $(TableTag);

                    var swims = [];

                    for (var i = 0; i < swimLists.length; i = i + 1) {
                        // get the table
                        var t = swimLists.get(i);

                        // convert table to array
                        ctp($);
                        var data = $(t).parsetable(true, true, true);

                        // inspect(data);

                        // get course
                        var SCLC = i === 0 ? 'LC' : 'SC';
                        var FromPool = i === 0 ? '50m' : '25m';
                        var ToPool = i === 0 ? '25m' : '50m';
                        var LCSC = i === 0 ? 'SC' : 'LC'; //get the other one
                        var stroke = '';
                        // manipulate array
                        for (var j = 0; j < data[0].length; j = j + 1) {

                            if (j > 0) {

                                //convert stroke to converted stoke
                                stroke = strokes[data[0][j]] === null ? data[0][j] : strokes[data[0][j]];

                                // console.debug('1.....', data[0][j]);
                                // console.debug('2.....', strokes[data[0][j]]);
                                // console.debug('3.....', stroke);


                                var swim = {
                                    course: SCLC,
                                    stroke: stroke,
                                    dateObtained: moment(data[3][j], 'DD/MM/YY').toDate(),
                                    timeDate: [{
                                        course: SCLC,
                                        timing: data[1][j],
                                        dateAndTime: moment(data[3][j] + '-' + data[1][j], 'DD/MM/YY-mm:ss.SSS').toObject(),
                                        calculated: false
                                    }, {
                                        course: LCSC,
                                        timing: stroke !== '100 IM' ? convertTime(
                                            stroke,
                                            FromPool,
                                            ToPool,
                                            data[1][j]) : data[1][j],
                                        dateAndTime: moment(stroke !== '100 IM' ? data[3][j] + '-' + convertTime(
                                            stroke,
                                            FromPool,
                                            ToPool,
                                            data[1][j]) : data[3][j] + '-' + data[1][j], 'DD/MM/YY-mm:ss.SSS').toObject(),
                                        calculated: true
                                    }],
                                    finaPts: data[2][j],
                                    meet: data[4][j],
                                    venue: data[5][j],
                                    license: data[6][j],
                                    level: data[7][j],
                                    dateCollected: new Date()
                                };
                                swims.push(swim);
                            }
                        }
                    }
                    resolve(swims);
                });
            });
        }

    };
    module.exports = scraper;

}());