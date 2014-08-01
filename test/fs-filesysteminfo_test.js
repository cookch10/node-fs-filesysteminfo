'use strict';

var fsi = require('../lib/index.js'),
    path = require('path');

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

if (!String.prototype.repeat) {
    String.prototype.repeat = function (num) {
        num = typeof num === 'number' ? parseInt(num) : 1;
        return new Array(num + 1).join(this);
    };
}

exports.nodeFsFilesysteminfo = {
    setUp: function (done) {
        /* setup here */
        this.tmpdir = new fsi.DirectoryInfo('./tmp'); // sandbox for directory / file testing.  The contents of this directory are not safe, as they are removed upon testing.

        if (!this.tmpdir.exists) { throw 'project/tmp directory does not exist'; }

        /* TODO:  Insert a clean method here for tmp directory */

        /* begin tests */
        done();
    },
    'DirectoryInfo-0.0': function (test) {
        /* description:  Basic DirectoryInfo construction / property tests. */

        /* number of assertions */
        test.expect(2);

        /* setup here */
        var dinfo = new fsi.DirectoryInfo('tst');

        /* tests here */
        test.equal(dinfo.fullName.indexOf(process.cwd()), 0, 'construction test');
        test.equal(dinfo.exists, false);

        /* finish here */
        test.done();
    },
    'DirectoryInfo-0.1': function (test) {
        /* description: Basic DirectoryInfo CreateSubdirectorySync() test. */

        /* number of assertions */
        test.expect(1);

        /* setup here */
        var tmpsubdir1 = this.tmpdir.CreateSubdirectorySync('subdir1');

        /* tests here */
        test.equal(tmpsubdir1.exists, true);

        /* finish here */
        test.done();
    },
    'DirectoryInfo-0.2': function (test) {
        /* description:  A more complex DirectoryInfo CreateSubdirectorySync() test. */

        /* number of assertions */
        test.expect(1);

        /* setup here */
        var tmpsubdir1 = this.tmpdir.CreateSubdirectorySync('subdir1/subdir2\\subdir3/last dir');

        /* tests here */
        test.equal(tmpsubdir1.exists, true);

        /* finish here */
        test.done();
    },
    'DirectoryInfo-0.3': function (test) {
        /* description:  A DirectoryInfo DeleteSubdirectorySync() test.  Deleting directories recursively. */

        /* number of assertions */
        test.expect(1);

        /* setup here */
        var tmpsubdir1 = this.tmpdir.CreateSubdirectorySync('subdir1');
        tmpsubdir1.DeleteSync(true);

        /* tests here */
        test.equal(tmpsubdir1.exists, false);

        /* finish here */
        test.done();
    },
    'FileInfo-0.1': function (test) {
        /* description:  A FileInfo test.  Creating a series of empty files with alternating CreateSync([mode]) overloads for creating read-only and non-read-only files. */

        /* number of assertions */
        var tmpfileCount = 10;
        test.expect(tmpfileCount * 2);

        /* setup here */
        var tmpdir = this.tmpdir;
        var tmpfilesArr = [];
        for (var i = 0; i < tmpfileCount; i++) {
            var tmpfileName = 'x'.repeat(i + 1) + '.tmp.txt';

            var tmpfile = new fsi.FileInfo(path.join(tmpdir.fullName, tmpfileName));

            if (i % 2 === 0) { tmpfile.CreateSync('777'); } else { tmpfile.CreateSync('400'); } // mode 400 is read only mode

            tmpfilesArr.push(tmpfile);
        }

        /* tests here */
        tmpfilesArr.forEach(function (finfo) {
            test.equal(finfo.exists, true);
        });

        tmpfilesArr.forEach(function (finfo) {
            finfo.DeleteSync();
            test.equal(finfo.exists, false);
        });

        /* finish here */
        test.done();
    }
};
