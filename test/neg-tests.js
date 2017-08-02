(function() {

    'use strict';

    var chai = require('chai');
    var chaiAsPromised = require('chai-as-promised');
    var gt = require('./../src/index.js').getTimes;

    chai.use(chaiAsPromised);

    // var expect = chai.expect;
    // var assert = chai.assert;
    // var should = chai.should();

    // Neg Tests - Data inputs
    it('ASA Number invalid', function() {
        //define some data to compare against
        var errmsg = 'ERR: Not a ASA Number';
        //call the function we're testing
        var gtPromise = gt('NotASANumber');
        return gtPromise.should.eventually.be.rejectedWith(errmsg);
    });

}());