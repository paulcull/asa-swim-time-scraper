(function() {
    'use strict';

    // var scraper = require('./scraper.js').scrapeSite;
    var scraper = require('./scraper');
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

                scraper.scrapeSite(url).then(function(swims) {
                        // scraper(url).then(function(swims) {
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
}());