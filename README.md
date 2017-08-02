# ASA Swim time scraper

This is a javascript website scraper for the ASA personal swim times. Pass in swimmer ASA Number and get back the personal best history from ASA.

## Status
[![Build Status](https://travis-ci.org/paulcull/asa-swim-time-scraper.svg?branch=master)](https://travis-ci.org/paulcull/asa-swim-time-scraper)
[![Coverage Status](https://coveralls.io/repos/github/paulcull/asa-swim-time-scraper/badge.svg?branch=master)](https://coveralls.io/github/paulcull/asa-swim-time-scraper?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/paulcull/asa-swim-time-scraper.svg)](https://greenkeeper.io/)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.svg)](https://gruntjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[![NPM Version](https://img.shields.io/npm/v/asa-swim-time-scraper.svg?style=flat)](https://www.npmjs.com/package/asa-swim-time-scraper)
[![NPM Downloads](https://img.shields.io/npm/dm/asa-swim-time-scraper.svg?style=flat)](https://www.npmjs.com/package/asa-swim-time-scraper)

## Getting Started

Include the library in your project. Pass the ASA Number. The single function will return the times.

### Prerequisites

What things you need to install the software and how to install them

```
None
```

### Installing

Install the library using npm...

```
npm install --save asa-swim-time-scraper
```

...or, take the library directly from githb

```
git clone https://github.com/paulcull/asa-swim-time-scraper
```

This library uses promises. The function when called returns a promise, allowing you to get on with anything else that you need to.
There are no runtime 3rd party dependencies in this library.

```
var getTime = require('asa-swim-time-scraper');

getTimes("99999999").then(function(times){
    console.log(times);
})
```
 - Also check the tests and example


## Running the tests

There are a limited number of tests. Several negative tests and a couple of checks on times to convert


```
npm test
```


## Deployment

Not designed to run stand-alone - this should be used as a libray.

## Built With

* [NPM](https://www.npm.org/) - Dependency Management
* [MOCHA](https://www.mochajs.org/) - Test management
* [CHAI](http://chaijs.com/) - BDD / TDD assertion (including with [PROMISES](https://github.com/domenic/chai-as-promised))


## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## TODO

These are things that should be done to complete.

 - [ ] Reduce / remove external dependancies
 - [ ] Add project documentation
 - [ ] Add simple example
 - [ ] Extend test cases to all strokes / pool lengths
 - [ ] Setup travis-ci
 - [ ] Add grunt to manage a min step and create a smaller footprint library
 - [ ] Introduce dependency monitoring
 - [ ] Publish to npm.org

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/paulcull/asa-swimtime-converter/tags).

## Authors

* **Paul Cullender** - *Initial work* - [paulcull](https://github.com/paulcull)

See also the list of [contributors](https://github.com/paulcull/asa-swimtime-converter/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* The excellent documentation on the method [here](https://www.swimmingresults.org/downloads/equivalent-time-share/algorithm.php) made this all possible
* The very reusable git documents from [PurpleBooth](https://gist.github.com/PurpleBooth/109311bb0361f32d87a2)
