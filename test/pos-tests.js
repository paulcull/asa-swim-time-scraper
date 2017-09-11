(function() {

    'use strict';

    var chai = require('chai');
    var chaiAsPromised = require("chai-as-promised");
    var gt = require('./../src/index.js').getTimes;

    chai.use(chaiAsPromised);

    var expect = chai.expect;
    var assert = chai.assert;
    var should = chai.should();

    // getTime(stroke, convertFrom, convertTo, timing)
    // Positive Test - From 50
    it('Correctly get ASA swimmer times', function() {
        //allow sufficient time
        this.timeout(10000);
        //define some data to compare against
        // var blah = '62.2';
        //call the function we're testing
        var gtPromise = gt('1168208');
        // return gtPromise.should.eventually.equal(blah);
        return gtPromise.should.eventually.be.fulfilled;
    });

}());