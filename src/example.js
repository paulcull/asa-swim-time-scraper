(function() {
    'use strict';

    var getTimes = require('./index.js').getTimes;
    // var inspect = require('eyes').inspector({ maxLength: false });

    var asaNo = '1168208';

    var toProcess = 0;
    getTimes(asaNo).then(function(swims) {
        toProcess = swims.length;
        //console.log('got my result, size is ' + toProcess);
        console.log(JSON.stringify(swims));
    });

}());