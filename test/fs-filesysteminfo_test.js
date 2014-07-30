'use strict';

var fsi = require('../lib/index.js');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.nodeFsFilesysteminfo = {
    setUp: function (done) {
        // setup here
        done();
    },
    'DirectoryInfo-0.1': function (test) {
        // number of assertions
        test.expect(1);

        // tests here
        var dinfo = new fsi.DirectoryInfo('tmp');
        test.equal(dinfo.fullName.indexOf(process.cwd()), 0, 'Basic test');
        test.done();
    }
};
