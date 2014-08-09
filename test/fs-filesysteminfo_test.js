'use strict';

var _fsi = require('../lib/index.js'),
    _path = require('path'),
    _async = require('../node_modules/async');

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

function isNullOrUndefined(obj) {
    return typeof obj === 'undefined' || obj === null;
}

exports.nodeFsFilesysteminfo = {
    setUp: function (done) {
        /*
         *  IMPORTANT NOTE REGARDING TESTS:
         *  Any content (files and/or directories) generated within a test should be created in the ./tmp directory.
         *  The content generated from a test should be cleaned up (deleted) just prior to calling test.done().
         *  The file .tmp/.gitignore must not be removed.
         */

        /* setup here */
        this.tmpdir = new _fsi.DirectoryInfo('./tmp'); // sandbox for directory / file testing.  The contents of this directory are not safe, as they are removed upon testing.

        if (!this.tmpdir.exists) { throw 'project/tmp directory does not exist'; }

        /* TODO:  Insert a clean method here for tmp directory */

        /* begin tests */
        done();
    },

    'DirectoryInfo': function (test) {
        /* description:  A simple DirectoryInfo construction / property tests. */

        /* number of assertions */
        test.expect(2);

        /* setup here */
        var dinfo = new _fsi.DirectoryInfo('0');

        /* tests here */
        test.equal(dinfo.fullName.indexOf(process.cwd()), 0, 'construction test');
        test.equal(dinfo.exists, false);

        /* finish here */
        test.done();
    },
    'DirectoryInfo-0.0.0-Sync': function (test) {
        /* description: simple DirectoryInfo CreateSubdirectorySync() test.*/

        /* number of assertions */
        test.expect(4);

        /* setup here */
        var tmpsubdir1 = this.tmpdir.CreateSubdirectorySync('subdir1');
        var tmpsubdir2 = new _fsi.DirectoryInfo(_path.join(this.tmpdir.fullName, 'subdir2')).CreateSync('777');

        /* tests here */
        test.equal(tmpsubdir1.exists, true);
        test.equal(tmpsubdir2.exists, true);

        tmpsubdir1.DeleteSync(true);
        tmpsubdir2.DeleteSync(true);

        test.equal(tmpsubdir1.exists, false);
        test.equal(tmpsubdir2.exists, false);

        /* finish here */
        test.done();
    },
    'DirectoryInfo-0.1.0-Sync': function (test) {
        /* description:  A simple DirectoryInfo CreateSubdirectorySync() test.  In this test, ./tmp/subdir1 should already exist from the previous test.*/

        /* number of assertions */
        test.expect(3);

        /* setup here */
        var tmpsubdir1 = this.tmpdir.CreateSubdirectorySync('subdir1'),
            tmpsubdir2 = this.tmpdir.CreateSubdirectorySync('subdir1/subdir2\\subdir3/last dir');

        /* tests here */
        test.equal(tmpsubdir1.exists, true);
        test.equal(tmpsubdir2.name, 'last dir');

        tmpsubdir1.DeleteSync(true);

        test.equal(tmpsubdir1.exists, false);

        /* finish here */
        test.done();
    },
    'DirectoryInfo-0.2.0-Sync': function (test) {
        /* description:  A simple DirectoryInfo CreateSync(), DeleteSync(), and property test(s).*/

        /* number of assertions */
        test.expect(3);

        /* setup here */
        var tmpdir = this.tmpdir;
        var tmpsubdir1 = tmpdir.CreateSubdirectorySync('subdir1');

        /* tests here */
        test.equal(tmpsubdir1.exists, true);

        tmpsubdir1.DeleteSync(true);

        test.equal(tmpsubdir1.exists, false);
        test.equal(tmpsubdir1.parent.fullName, tmpdir.fullName); // Note that while tmpsubdir1.parent and this.tmpdir.fullName are equivalent, but they are not equal (i.e. they are not the same object).

        /* finish here */
        test.done();
    },
    'DirectoryInfo-0.3.0-Sync': function (test) {
        /* description:  A complex DirectoryInfo EnumerateFileSystemInfosSync() test.*/

        /* number of assertions */
        test.expect(7);

        /* setup here */
        var tmpdir = this.tmpdir,
            tmpfileCount = 10,
            tmpsubdir1 = tmpdir.CreateSubdirectorySync('subdir1'),
            tmpsubdir2 = tmpdir.CreateSubdirectorySync('subdir2'),
            tmpsubdir3 = tmpdir.CreateSubdirectorySync('subdir3/subdir4/subdir5'),
            tmpfilesArr = [];

        for (var i = 0; i < tmpfileCount; i++) {
            var tmpfileName = 'x'.repeat(i + 1) + '.tmp.txt';

            var tmpfile = new _fsi.FileInfo(_path.join(tmpsubdir1.fullName, tmpfileName));

            if (i % 2 === 0) { tmpfile.CreateSync({ mode: '777', ensure: false }); } else { tmpfile.CreateSync({ mode: '400', ensure: false }); } // mode 400 is read only mode

            tmpfilesArr.push(tmpfile);
        }

        var tmpdirContentsArr = tmpdir.EnumerateFileSystemInfosSync({ fnFilter: function (fsname) { return (fsname !== '.gitignore'); }, recursive: true });

        /* tests here */
        test.equal(tmpsubdir1.exists, true);
        test.equal(tmpsubdir2.exists, true);
        test.equal(tmpsubdir3.exists, true);
        test.equal(tmpdirContentsArr.length, tmpfilesArr.length + 5);

        tmpsubdir1.DeleteSync(true);
        tmpsubdir2.DeleteSync(true);

        var tmpsubdir3a = tmpdir.CreateSubdirectorySync('subdir3'); // TODO:  Change CreateSubdirectorySync() to GetDirectorySync() (currently using CreateSubdirectorySync as a shortcut)
        tmpsubdir3a.DeleteSync(true);

        test.equal(tmpsubdir1.exists, false);
        test.equal(tmpsubdir2.exists, false);
        test.equal(tmpsubdir3a.exists, false);

        /* finish here */
        test.done();
    },
    'DirectoryInfo-0.0.0-Async': function (test) {
        /* description: simple DirectoryInfo CreateSubdirectory() asynchronous (async) test.*/

        /* number of assertions */
        test.expect(8);

        /* setup here */
        var tmpdir = this.tmpdir;

        tmpdir.CreateSubdirectory('subdir1', '777', function (error1, result) {
            /* tests here */
            test.equal(true, isNullOrUndefined(error1));
            test.equal(this, tmpdir); // ensure that `this` context is the originating DirectoryInfo instance.
            test.equal(result.exists, true);

            var tmpsubdir2 = new _fsi.DirectoryInfo(_path.join(this.fullName, 'subdir2'));

            test.equal(tmpsubdir2.exists, false);

            tmpsubdir2.Create('777', function (error2, result) {
                /* tests here */
                test.equal(result, tmpsubdir2);
                test.equal(true, isNullOrUndefined(error2));
                test.equal(this.tmpsubdir2);
                test.equal(this.exists, true);

                tmpsubdir2.DeleteSync(true);

                /* finish here */
                test.done();
            });
        });
    },
    'DirectoryInfo-0.1.0-Async': function (test) {
        /* description:  A complex DirectoryInfo CreateSubdirectory() asynchronous (async) test.*/

        /* number of assertions */
        test.expect(2);

        /* setup here */
        var tmpdir = this.tmpdir;

        tmpdir.CreateSubdirectory('subdir1/subdir2\\subdir3/last dir', '777', function (error, result) {
            /* tests here */
            test.equal(this, tmpdir); // ensure that `this` context is the originating DirectoryInfo instance.
            test.equal(result.exists, true);

            var tmpsubdir1 = this.EnumerateFileSystemInfosSync({ fnFilter: function (fsname) { return /subdir1/i.test(fsname); }, recursive: true })[0];

            tmpsubdir1.DeleteSync(true);

            /* finish here */
            test.done();
        });
    },
    'DirectoryInfo-0.2.0-Async': function (test) {
        /* description:  A simple DirectoryInfo Create(), Delete(recursive) asynchronous (async), and property test(s).*/

        /* number of assertions */
        test.expect(7);

        /* setup here */
        var tmpdir = this.tmpdir;

        this.tmpdir.CreateSubdirectory('subdir1', function (error1, result) {
            /* tests here */
            test.equal(true, isNullOrUndefined(error1));
            test.equal(this, tmpdir);
            test.equal(result.exists, true);

            result.Delete(true, function (error2) {
                test.equal(true, isNullOrUndefined(error2));
                test.equal(this, result);
                test.equal(this.exists, false);
                test.equal(this.parent.fullName, tmpdir.fullName); // Note that while tmpsubdir1.parent and this.tmpdir.fullName are equivalent, but they are not equal (i.e. they are not the same object).

                /* finish here */
                test.done();
            });
        });
    },
    'DirectoryInfo-0.3.0-Async': function (test) {
        /* description:  A complex DirectoryInfo EnumerateFileSystemInfos() asynchronous (async) test with recursive = true.*/

        /* number of assertions */
        test.expect(11);

        /* setup here */
        var tmpdir = this.tmpdir,
            tmpfileCount = 10,
            tmpsubdir1 = tmpdir.CreateSubdirectorySync('subdir1'),
            tmpsubdir2 = tmpdir.CreateSubdirectorySync('subdir2'),
            tmpsubdir3 = tmpdir.CreateSubdirectorySync('subdir3/subdir4/subdir5'),
            tmpfilesArr = [];

        for (var i = 0; i < tmpfileCount; i++) {
            var tmpfileName = 'x'.repeat(i + 1) + '.tmp.txt';

            var tmpfile = new _fsi.FileInfo(_path.join(tmpsubdir1.fullName, tmpfileName));

            if (i % 2 === 0) { tmpfile.CreateSync({ mode: '777', ensure: false }); } else { tmpfile.CreateSync({ mode: '400', ensure: false }); } // mode 400 is read only mode

            tmpfilesArr.push(tmpfile);
        }

        tmpdir.EnumerateFileSystemInfos({ fnFilter: function (fsname) { return (fsname !== '.gitignore'); }, recursive: true }, function (error, result) {
            var directoriesArr = [],
                filesArr = [];

            result.forEach(function (fsinfo) {
                var fstype = fsinfo.GetType();

                if (fstype === 'DirectoryInfo') {
                    directoriesArr.push(fsinfo);
                } else {
                    filesArr.push(fsinfo);
                }
            });

            /* tests here */
            test.equals(true, isNullOrUndefined(error));
            test.equal(result.length, tmpfilesArr.length + 5);
            test.equals(this, tmpdir);
            test.equals(directoriesArr.length, 5);
            test.equals(tmpfilesArr.length, tmpfileCount);
            test.equals(tmpsubdir1.exists, true);
            test.equals(tmpsubdir2.exists, true);
            test.equals(tmpsubdir3.exists, true);

            tmpsubdir1.DeleteSync(true);
            tmpsubdir2.DeleteSync(true);

            var tmpsubdir3a = tmpdir.CreateSubdirectorySync('subdir3'); // TODO:  Change CreateSubdirectorySync() to GetDirectorySync() (currently using CreateSubdirectorySync as a shortcut)
            tmpsubdir3a.DeleteSync(true);

            test.equals(tmpsubdir1.exists, false);
            test.equals(tmpsubdir2.exists, false);
            test.equals(tmpsubdir3a.exists, false);

            /* finish here */
            test.done();
        });
    },
    'DirectoryInfo-0.3.1-Async': function (test) {
        /* description:  A complex DirectoryInfo EnumerateFileSystemInfos() asynchronous (async) test with recursive = false.*/

        /* number of assertions */
        test.expect(11);

        /* setup here */
        var tmpdir = this.tmpdir,
            tmpfileCount = 10,
            tmpsubdir1 = tmpdir.CreateSubdirectorySync('subdir1'),
            tmpsubdir2 = tmpdir.CreateSubdirectorySync('subdir2'),
            tmpsubdir3 = tmpdir.CreateSubdirectorySync('subdir3/subdir4/subdir5'),
            tmpfilesArr = [];

        for (var i = 0; i < tmpfileCount; i++) {
            var tmpfileName = 'x'.repeat(i + 1) + '.tmp.txt';

            var tmpfile = new _fsi.FileInfo(_path.join(tmpsubdir1.fullName, tmpfileName));

            if (i % 2 === 0) { tmpfile.CreateSync({ mode: '777', ensure: false }); } else { tmpfile.CreateSync({ mode: '400', ensure: false }); } // mode 400 is read only mode

            tmpfilesArr.push(tmpfile);
        }

        tmpdir.EnumerateFileSystemInfos({ fnFilter: function (fsname) { return (fsname !== '.gitignore'); }, recursive: false }, function (error, result) {
            var directoriesArr = [],
                filesArr = [];

            result.forEach(function (fsinfo) {
                var fstype = fsinfo.GetType();
                if (fstype === 'DirectoryInfo') {
                    directoriesArr.push(fsinfo);
                } else {
                    filesArr.push(fsinfo);
                }
            });

            /* tests here */
            test.equals(true, isNullOrUndefined(error));
            test.equal(result.length, 3);
            test.equals(this, tmpdir);
            test.equals(directoriesArr.length, 3);
            test.equals(tmpfilesArr.length, tmpfileCount);
            test.equals(tmpsubdir1.exists, true);
            test.equals(tmpsubdir2.exists, true);
            test.equals(tmpsubdir3.exists, true);

            tmpsubdir1.DeleteSync(true);
            tmpsubdir2.DeleteSync(true);

            var tmpsubdir3a = tmpdir.CreateSubdirectorySync('subdir3'); // TODO:  Change CreateSubdirectorySync() to GetDirectorySync() (currently using CreateSubdirectorySync as a shortcut)
            tmpsubdir3a.DeleteSync(true);

            test.equals(tmpsubdir1.exists, false);
            test.equals(tmpsubdir2.exists, false);
            test.equals(tmpsubdir3a.exists, false);

            /* finish here */
            test.done();
        });
    },
    'DirectoryInfo-0.4.0-Async': function (test) {
        /* description:  A complex DirectoryInfo Delete() asynchronous (async) test with recursive = true.*/

        /* number of assertions */
        test.expect(8);

        /* setup here */
        var tmpdir = this.tmpdir,
            tmpfileCount = 10,
            tmpsubdir1 = tmpdir.CreateSubdirectorySync('subdir1'),
            tmpsubdir2 = tmpdir.CreateSubdirectorySync('subdir2'),
            tmpsubdir3 = tmpdir.CreateSubdirectorySync('subdir3/subdir4/subdir5'),
            tmpfilesArr = [];

        for (var i = 0; i < tmpfileCount; i++) {
            var tmpfileName = 'x'.repeat(i + 1) + '.tmp.txt';

            var tmpfile = new _fsi.FileInfo(_path.join(tmpsubdir3.fullName, tmpfileName));

            if (i % 2 === 0) { tmpfile.CreateSync({ mode: '777', ensure: false }); } else { tmpfile.CreateSync({ mode: '400', ensure: false }); } // mode 400 is read only mode

            tmpfilesArr.push(tmpfile);
        }

        tmpdir.EnumerateFileSystemInfos({ fnFilter: function (fsname) { return (fsname !== '.gitignore'); }, recursive: false }, function (error, result) {
            var directoriesArr = [],
                filesArr = [];

            result.forEach(function (fsinfo) {
                var fstype = fsinfo.GetType();
                if (fstype === 'DirectoryInfo') {
                    directoriesArr.push(fsinfo);
                } else {
                    filesArr.push(fsinfo);
                }
            });

            /* tests here */
            test.equals(true, isNullOrUndefined(error));
            test.equal(result.length, 3);
            test.equals(this, tmpdir);
            test.equals(directoriesArr.length, 3);
            test.equals(tmpfilesArr.length, tmpfileCount);

            /* finish here */
            tmpsubdir1.DeleteSync(true);
            tmpsubdir2.DeleteSync(true);

            var tmpsubdir3a = tmpdir.CreateSubdirectorySync('subdir3'); // TODO:  Change CreateSubdirectorySync() to GetDirectorySync() (currently using CreateSubdirectorySync as a shortcut)

            tmpsubdir3a.Delete(true, function (error) {
                test.equals(true, isNullOrUndefined(error));
                test.equals(this, tmpsubdir3a);
                test.equals(this.exists, false);
                test.done();
            });

        });
    },

    'FileInfo': function (test) {
        /* description:  A simple FileInfo construction / property tests. */

        /* number of assertions */
        test.expect(3);

        /* setup here */
        var finfo = new _fsi.FileInfo('0.txt');

        /* tests here */
        test.equal(finfo.fullName.indexOf(process.cwd()), 0, 'construction test');
        test.equal(finfo.extension, '.txt');
        test.equal(finfo.exists, false);

        /* finish here */
        test.done();
    },
    'FileInfo-0.0.0-Sync': function (test) {
        /* description: simple FileInfo CreateSync() and DeleteSync() test.*/

        /* number of assertions */
        test.expect(2);

        /* setup here */
        var tmpfile = new _fsi.FileInfo(_path.join(this.tmpdir.fullName, 'tmp.txt'));

        tmpfile.CreateSync(); // opts default equals { mode: '777', ensure: false, overwrite: true }

        /* tests here */
        test.equal(tmpfile.exists, true);
        tmpfile.DeleteSync();
        test.equal(tmpfile.exists, false);

        /* finish here */
        test.done();
    },
    'FileInfo-0.1.0-Sync': function (test) {
        /* description:  A complex FileInfo CreateSync() and DeleteSync() test.  Testing FileInfo.CreateSync() with varying {opts}.*/

        /* number of assertions */
        test.expect(5);

        /* setup here */
        var tmpdir = this.tmpdir;
        var tmpfile = new _fsi.FileInfo(_path.join(tmpdir.fullName, 'subdir1', 'tmp.txt'));

        /* tests here */
        test.equals(tmpfile.parent.exists, false);
        test.throws(function () { tmpfile.CreateSync({ mode: '777', ensure: false }); }); // The parent directory does not exist and since `ensure` is false, the file will not be created.
        test.equals(tmpfile.exists, false);

        tmpfile.CreateSync({ mode: '777', ensure: true }); // The parent directory does not exist however it will be created since `ensure` is true.
        test.equals(tmpfile.exists, true);
        tmpfile.parent.DeleteSync(true);

        tmpfile.CreateSync({ ensure: true }); // Same as above except omitting the `mode` parameter.  The parent directory does not exist however it will be created since `ensure` is true.
        test.equals(tmpfile.exists, true);
        tmpfile.parent.DeleteSync(true);

        /* finish here */
        test.done();
    },
    'FileInfo-0.2.0-Sync': function (test) {
        /* description:  A complex FileInfo CreateSync() and DeleteSync() test.  Creating a series of empty files with alternating CreateSync() `mode` options for creating read-only and non-read-only files.  Also testing EnumerateFileSystemInfosSync().*/

        /* number of assertions */
        var tmpfileCount = 10;

        test.expect(tmpfileCount * 3);

        /* setup here */
        var tmpdir = this.tmpdir,
            tmpfilesArr = [];

        for (var i = 0; i < tmpfileCount; i++) {
            var tmpfileName = 'x'.repeat(i + 1) + '.tmp.txt';

            var tmpfile = new _fsi.FileInfo(_path.join(tmpdir.fullName, tmpfileName));

            if (i % 2 === 0) { tmpfile.CreateSync({ mode: '777', ensure: false }); } else { tmpfile.CreateSync({ mode: '400', ensure: false }); } // mode 400 is read only mode

            tmpfilesArr.push(tmpfile);
        }

        /* tests here */
        tmpfilesArr.forEach(function (tmpfile) {
            test.equal(tmpfile.exists, true);
        });

        var tmpdirContentsArr = tmpdir.EnumerateFileSystemInfosSync({ fnFilter: function (fsname) { return /^x(?:\w+)?\.tmp\.txt$/i.test(fsname); }, recursive: true });
        tmpdirContentsArr.forEach(function (tmpfile) {
            test.equal(tmpfile.exists, true);
        });

        tmpfilesArr.forEach(function (tmpfile) {
            tmpfile.DeleteSync();
            test.equal(tmpfile.exists, false);
        });

        /* finish here */
        test.done();
    },
    'FileInfo-0.0.0-Async': function (test) {
        /* description: simple FileInfo Create() and Delete() asynchronous (async) test.*/

        /* number of assertions */
        test.expect(9);

        /* setup here */
        this.tmpdir.CreateSubdirectory('subdir1', function (error1, result) {
            test.equal(true, isNullOrUndefined(error1));

            var tmpfile = new _fsi.FileInfo(_path.join(result.fullName, 'tmp.txt'));

            //Testing FileInfo.Create() with no options object, only a callback.
            tmpfile.Create(function (error2) {
                /* tests here */
                test.equal(true, isNullOrUndefined(error2));
                test.equal(this, tmpfile); // ensure that `this` context is the originating FileInfo instance.
                test.equal(this.exists, true);

                this.Delete(function (error3) {
                    test.equal(true, isNullOrUndefined(error3));
                    test.equal(this.exists, false);

                    this.parent.Delete(function (error4) {
                        /* finish here */
                        test.equal(true, isNullOrUndefined(error4));
                        test.equal(this, tmpfile.parent);
                        test.equal(this.exists, false);
                        test.done();
                    });
                });
            });
        });
    },
    'FileInfo-0.1.0-Async': function (test) {
        /* description:  A complex FileInfo Create() and Delete() asynchronous (async) test.  Testing the FileInfo.Create() with varying {opts}.*/

        /* number of assertions */
        test.expect(19);

        /* setup here */
        var tmpdir = this.tmpdir,
            tmpfile = new _fsi.FileInfo(_path.join(tmpdir.fullName, 'subdir1', 'tmp.txt')),
            tmpfileCreateOptsArr = [
            { mode: '777', ensure: false },
            { mode: '777', ensure: true },
            { mode: '444', ensure: true }
            ];

        _async.eachSeries(tmpfileCreateOptsArr, function (opts, cb) {
            cb.opts = opts;

            /* tests here */
            test.equals(tmpfile.parent.exists, false); // expect 3

            tmpfile.Create(opts, function (error1) {
                test.equal(this, tmpfile); // expect 3

                var opts = cb.opts;

                if (opts.ensure) {
                    test.equal(this.exists, true); // expect 2

                    this.Delete(function (error2) {
                        test.equal(true, isNullOrUndefined(error2)); // expect 2
                        test.equal(this.exists, false); // expect 2

                        this.parent.Delete(function (error3) {
                            /* finish here */
                            test.equal(this, tmpfile.parent); // expect 2
                            test.equal(this.exists, false); // expect 2

                            cb(error3);
                        });
                    });
                } else {
                    test.equal(false, isNullOrUndefined(error1)); // expect 1
                    test.equal(this.exists, false); // expect 1

                    cb(null);
                }
            });
        }.bind(tmpfile), function (error) {
            /* finish here */
            test.equal(true, isNullOrUndefined(error)); // expect 1
            test.done();
        });
    }
};