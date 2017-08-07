(function() {
    'use strict';

    var scraper = require('./scraper.js').scrapeSite;
    //var inspect = require('eyes').inspector({ maxLength: false });

    var isDebugMode = false;
    var URLHost = 'https://www.swimmingresults.org';
    var URLPath = '/individualbest/personal_best.php';

    //debug log support
    console.debug = function( /* ...args */ ) {
        if (isDebugMode) {
            var vargs = Array.prototype.slice.call(arguments);
            console.log.apply(this, vargs);
        }
    };

    // Exposed Functions

    var timings = {

        /**
         *  getTimes function to scrape Swim times from ASA table
         * getTime(asaNumber)
         *
         * inputs
         * @param {number} asaNumber is the swimmers ASA number.
         *
         * returns
         * @return {array} times form the website
         *
         */
        getTimes: function(asaNumber) {
            return new Promise(function(resolve, reject) {

                //check asa number is a number
                if (!asaNumber.match(/[0-9]/i)) {
                    reject('ERR: Not a ASA Number');
                }

                var year = new Date().getFullYear().toString();

                var url = URLHost + URLPath + '?' +
                    //'back=showmeets' +
                    '&targetyear=' + year +
                    //'&masters=' + '0' +
                    //'&pgm=' + '1' +
                    //'&meetcode=' + '10225' +
                    //'&targetAZ=' + 'C' +
                    //'&pgs=' + '1' +
                    '&tiref=' + asaNumber +
                    '&mode=' + 'A';

                scraper(url).then(function(swims) {
                        console.debug('got my result, size is ' + swims.length);
                        //inspect(swims);
                        resolve(swims);
                    })
                    .catch(function(error) {
                        reject('ERR: Error getting site times: ', error);
                    });
            });
        }
    };

    module.exports = timings;
}());(function() {
    'use strict';

    var cheerio = require('cheerio');
    var ctp = require('cheerio-tableparser');
    var request = require('request');
    var strokes = require('./strokeList');
    //var inspect = require('eyes').inspector({ maxLength: false });
    // var _ = require('underscore');
    var moment = require('moment');
    var convertTime = require('asa-swim-time-converter').getTime;

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    var TableTag = 'table#rankTable';

    var scraper = {

        scrapeSite: function scrapeSite(url) {
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

                        //inspect(data);

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

                                console.debug('1.....', data[0][j]);
                                console.debug('2.....', strokes[data[0][j]]);
                                console.debug('3.....', stroke);


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

}());var strokeTable = {
    '50 Freestyle': '50 Free',
    '100 Freestyle': '100 Free',
    '200 Freestyle': '200 Free',
    '400 Freestyle': '400 Free',
    '800 Freestyle': '800 Free',
    '1500 Freestyle': '1500 Free',
    '50 Breaststroke': '50 Breast',
    '100 Breaststroke': '100 Breast',
    '200 Breaststroke': '200 Breast',
    '50 Butterfly': '50 Fly',
    '100 Butterfly': '100 Fly',
    '200 Butterfly': '200 Fly',
    '50 Backstroke': '50 Back',
    '100 Backstroke': '100 Back',
    '200 Backstroke': '200 Back',
    '100 Individual Medley': '100 IM',
    '200 Individual Medley': '200 IM',
    '400 Individual Medley': '400 IM'
};

module.exports = strokeTable;