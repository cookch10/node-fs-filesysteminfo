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

function cleanDirectorySync(dInfo) {
    var fsItemArr = dInfo.enumerateFileSystemInfosSync({ fnFilter: function (fsname) { return (fsname !== '.gitignore'); }, recursive: false });

    for (var i = 0, ii = fsItemArr.length; i < ii; i++) {
        var fsItem = fsItemArr[i];

        fsItem.deleteSync(true); // passing a value of true will have no effect if fsItem is of type FileInfo.  If the item is of type DirectoryInfo, passing true will delete all items recursively under the subdirectory and the subdirectory itself.
    }

    return dInfo;
}

function cleanDirectoryAsync(dInfo, cb) {
    dInfo.enumerateFileSystemInfos({ fnFilter: function (fsname) { return (fsname !== '.gitignore'); }, recursive: false }, function (error, result) {
        var fnCallback = function (isComplete) {
            if (isComplete && typeof cb === 'function') {
                cb();
            }
        };

        if (!result.length) { return fnCallback(true); }

        for (var i = 0, ii = result.length; i < ii; i++) {
            var fsItem = result[i];

            fsItem.delete(true, fnCallback.bind(this, i === ii - 1));
        }
    });
}

exports.nodeFsFileSystemInfoAsync = {
    setUp: function (done) {
        /*
         *  IMPORTANT NOTE REGARDING TESTS:
         *  Any content (files and/or directories) generated within a test should be created in the ./tmp directory.
         *  The content generated from a test should be cleaned up (deleted) just prior to calling test.done().
         *  The file .tmp/.gitignore must not be removed.
         */

        /* setup here */
        var tmpdir = this.tmpdir = new _fsi.DirectoryInfo('./tmp'); // sandbox for directory / file testing.  The contents of this directory are not safe, as they are removed upon testing.

        if (!tmpdir.exists) { throw 'project/tmp directory does not exist'; }

        /* begin tests */
        cleanDirectoryAsync(tmpdir, done);
    },
    tearDown: function (done) {
        /* teardown here */

        /* clean all existing content inside the tmp directory */
        var tmpdir = this.tmpdir;

        cleanDirectoryAsync(tmpdir, done);
    },

    'DirectoryInfo-0.0.0-Async': function (test) {
        /* description: simple DirectoryInfo createSubdirectory() asynchronous (async) test.*/

        /* number of assertions */
        test.expect(17);

        /* setup here */
        var tmpdir = this.tmpdir;

        tmpdir.createSubdirectory('subdir1', '777', function (error1, result) {
            /* tests here */
            test.equal(true, isNullOrUndefined(error1));
            test.equal(this, tmpdir); // ensure that `this` context is the originating DirectoryInfo instance.

            test.equal(result.getType(), 'DirectoryInfo');
            test.equal(result.flags.isDirectory, true);
            test.equal(result.exists, true);  // The check for .exists is intentionally placed after the flags.isDirectory check above, since exists will cause an internal Refresh() of the object, and we want to know that the flags are being set properly upon initialization.  CMC 2015-01-22 10:23:17 AM

            var tmpsubdir2 = new _fsi.DirectoryInfo(_path.join(this.fullName, 'subdir2'));

            test.equal(tmpsubdir2.getType(), 'DirectoryInfo');
            test.equal(tmpsubdir2.flags.isDirectory, false);
            test.equal(tmpsubdir2.exists, false);

            tmpsubdir2.create('777', function (error2, result) {
                /* tests here */
                test.equal(true, isNullOrUndefined(error2));
                test.equal(this, tmpsubdir2);
                test.equal(result, tmpsubdir2);

                test.equal(tmpsubdir2.getType(), 'DirectoryInfo');
                test.equal(tmpsubdir2.flags.isDirectory, true);
                test.equal(this.exists, true);

                tmpsubdir2.delete(true, function (error3) {
                    /* tests here */
                    test.equal(true, isNullOrUndefined(error3));
                    test.equal(this.flags.isDirectory, true);
                    test.equal(this.exists, false);

                    /* finish here */
                    test.done();
                });
            });
        });
    },
    'DirectoryInfo-0.1.0-Async': function (test) {
        /* description:  A complex DirectoryInfo createSubdirectory() asynchronous (async) test.*/

        /* number of assertions */
        test.expect(8);

        /* setup here */
        var tmpdir = this.tmpdir;

        tmpdir.createSubdirectory('subdir1/subdir2\\subdir3/last dir', '777', function (error1, result1) {
            /* tests here */
            test.equal(true, isNullOrUndefined(error1));
            test.equal(this, tmpdir); // ensure that `this` context is the originating DirectoryInfo instance.
            test.equal(result1.exists, true);

            this.enumerateFileSystemInfos({ fnFilter: function (fsname) { return /subdir1/i.test(fsname); }, recursive: true }, function (error2, result2) {
                var tmpsubdir1 = result2[0];

                /* tests here */
                test.equal(true, isNullOrUndefined(error2));
                test.equal(tmpsubdir1.exists, true);

                tmpsubdir1.delete(true, function (error3) {
                    /* tests here */
                    test.equal(true, isNullOrUndefined(error3));
                    test.equal(this, tmpsubdir1);
                    test.equal(tmpsubdir1.exists, false);

                    /* finish here */
                    test.done();
                });
            });
        });
    },
    'DirectoryInfo-0.2.0-Async': function (test) {
        /* description:  A simple DirectoryInfo create(), delete(recursive) asynchronous (async), and property test(s).*/

        /* number of assertions */
        test.expect(7);

        /* setup here */
        var tmpdir = this.tmpdir;

        this.tmpdir.createSubdirectory('subdir1', function (error1, result) {
            /* tests here */
            test.equal(true, isNullOrUndefined(error1));
            test.equal(this, tmpdir);
            test.equal(result.exists, true);

            result.delete(true, function (error2) {
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
        /* description:  A complex DirectoryInfo enumerateFileSystemInfos() asynchronous (async) test with recursive = true.*/

        /* number of assertions */
        test.expect(20);

        /* setup here */
        var tmpdir = this.tmpdir,
            tmpfileCount = 10,
            tmpsubdir1 = tmpdir.createSubdirectorySync('subdir1'),
            tmpsubdir2 = tmpdir.createSubdirectorySync('subdir2'),
            tmpsubdir3 = tmpdir.createSubdirectorySync('subdir3/subdir4/subdir5'),
            tmpsubdir3a,
            tmpfilesArr = [];

        for (var i = 0; i < tmpfileCount; i++) {
            var tmpfileName = 'x'.repeat(i + 1) + '.tmp.txt';

            var tmpfile = new _fsi.FileInfo(_path.join(tmpsubdir1.fullName, tmpfileName));

            if (i % 2 === 0) { tmpfile.createSync({ mode: '777', ensure: false }); } else { tmpfile.createSync({ mode: '400', ensure: false }); } // mode 400 is read only mode

            tmpfilesArr.push(tmpfile);
        }

        tmpdir.enumerateFileSystemInfos({ fnFilter: function (fsname) { return (fsname !== '.gitignore'); }, recursive: true }, function (error, result) {
            var directoriesArr = [],
                filesArr = [];

            var fnResultIterator = function (fsinfo) {
                var fstype = fsinfo.getType();

                if (fstype === 'DirectoryInfo') {
                    directoriesArr.push(fsinfo);
                } else {
                    filesArr.push(fsinfo);
                }
            };

            result.forEach(fnResultIterator);

            /* tests here */
            test.equals(true, isNullOrUndefined(error));
            test.equal(result.length, tmpfilesArr.length + 5);
            test.equals(this, tmpdir);
            test.equals(directoriesArr.length, 5);
            test.equals(tmpfilesArr.length, tmpfileCount);
            test.equals(tmpsubdir1.exists, true);
            test.equals(tmpsubdir2.exists, true);
            test.equals(tmpsubdir3.exists, true);

            tmpsubdir1.delete(true, function (error1) {
                /* tests here */
                test.equal(true, isNullOrUndefined(error1));
                test.equals(this, tmpsubdir1);
                test.equals(this.exists, false);

                tmpsubdir2.delete(true, function (error2) {
                    /* tests here */
                    test.equal(true, isNullOrUndefined(error2));
                    test.equals(this, tmpsubdir2);
                    test.equals(this.exists, false);

                    tmpsubdir3a = tmpdir.createSubdirectory('subdir3', function (error3, result) {
                        /* tests here */
                        test.equal(true, isNullOrUndefined(error3));
                        test.equals(this, tmpdir);
                        test.equals(result.fullName, tmpsubdir3.parent.parent.fullName);
                        test.equals(result.exists, true);

                        result.delete(true, function (error4) {
                            /* tests here */
                            test.equal(true, isNullOrUndefined(error4));
                            test.equals(this.exists, false);

                            /* finish here */
                            test.done();
                        });

                    });

                });
            });
        });
    },
    'DirectoryInfo-0.3.1-Async': function (test) {
        /* description:  A complex DirectoryInfo enumerateFileSystemInfos() asynchronous (async) test with recursive = false.*/

        /* number of assertions */
        test.expect(11);

        /* setup here */
        var tmpdir = this.tmpdir,
            tmpfileCount = 10,
            tmpsubdir1 = tmpdir.createSubdirectorySync('subdir1'),
            tmpsubdir2 = tmpdir.createSubdirectorySync('subdir2'),
            tmpsubdir3 = tmpdir.createSubdirectorySync('subdir3/subdir4/subdir5'),
            tmpfilesArr = [];

        for (var i = 0; i < tmpfileCount; i++) {
            var tmpfileName = 'x'.repeat(i + 1) + '.tmp.txt';

            var tmpfile = new _fsi.FileInfo(_path.join(tmpsubdir1.fullName, tmpfileName));

            if (i % 2 === 0) { tmpfile.createSync({ mode: '777', ensure: false }); } else { tmpfile.createSync({ mode: '400', ensure: false }); } // mode 400 is read only mode

            tmpfilesArr.push(tmpfile);
        }

        tmpdir.enumerateFileSystemInfos({ fnFilter: function (fsname) { return (fsname !== '.gitignore'); }, recursive: false }, function (error, result) {
            var directoriesArr = [],
                filesArr = [];

            result.forEach(function (fsinfo) {
                var fstype = fsinfo.getType();
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

            tmpsubdir1.deleteSync(true);
            tmpsubdir2.deleteSync(true);

            var tmpsubdir3a = tmpdir.createSubdirectorySync('subdir3'); // TODO:  Change createSubdirectorySync() to GetDirectorySync() (currently using createSubdirectorySync as a shortcut)
            tmpsubdir3a.deleteSync(true);

            test.equals(tmpsubdir1.exists, false);
            test.equals(tmpsubdir2.exists, false);
            test.equals(tmpsubdir3a.exists, false);

            /* finish here */
            test.done();
        });
    },
    'DirectoryInfo-0.4.0-Async': function (test) {
        /* description:  A complex DirectoryInfo delete() asynchronous (async) test with recursive = true.*/

        /* number of assertions */
        test.expect(8);

        /* setup here */
        var tmpdir = this.tmpdir,
            tmpfileCount = 10,
            tmpsubdir1 = tmpdir.createSubdirectorySync('subdir1'),
            tmpsubdir2 = tmpdir.createSubdirectorySync('subdir2'),
            tmpsubdir3 = tmpdir.createSubdirectorySync('subdir3/subdir4/subdir5'),
            tmpfilesArr = [];

        for (var i = 0; i < tmpfileCount; i++) {
            var tmpfileName = 'x'.repeat(i + 1) + '.tmp.txt';

            var tmpfile = new _fsi.FileInfo(_path.join(tmpsubdir3.fullName, tmpfileName));

            if (i % 2 === 0) { tmpfile.createSync({ mode: '777', ensure: false }); } else { tmpfile.createSync({ mode: '400', ensure: false }); } // mode 400 is read only mode

            tmpfilesArr.push(tmpfile);
        }

        tmpdir.enumerateFileSystemInfos({ fnFilter: function (fsname) { return (fsname !== '.gitignore'); }, recursive: false }, function (error, result) {
            var directoriesArr = [],
                filesArr = [];

            result.forEach(function (fsinfo) {
                var fstype = fsinfo.getType();
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
            tmpsubdir1.deleteSync(true);
            tmpsubdir2.deleteSync(true);

            var tmpsubdir3a = tmpdir.createSubdirectorySync('subdir3'); // TODO:  Change createSubdirectorySync() to GetDirectorySync() (currently using createSubdirectorySync as a shortcut)

            tmpsubdir3a.delete(true, function (error) {
                test.equals(true, isNullOrUndefined(error));
                test.equals(this, tmpsubdir3a);
                test.equals(this.exists, false);
                test.done();
            });

        });
    },

    'FileInfo-0.0.0-Async': function (test) {
        /* description: simple FileInfo create() and delete() asynchronous (async) test.*/

        /* number of assertions */
        test.expect(12);

        /* setup here */
        this.tmpdir.createSubdirectory('subdir1', function (error1, result) {
            test.equal(true, isNullOrUndefined(error1));

            var tmpfile = new _fsi.FileInfo(_path.join(result.fullName, 'tmp.txt'));

            //Testing FileInfo.create() with no options object, only a callback.
            tmpfile.create(function (error2) {
                /* tests here */
                test.equal(true, isNullOrUndefined(error2));
                test.equal(this, tmpfile); // ensure that `this` context is the originating FileInfo instance.
                test.equal(this.getType(), 'FileInfo');
                test.equal(this.flags.isFile, true);
                test.equal(this.exists, true);

                this.delete(function (error3) {
                    test.equal(this, tmpfile); // ensure that `this` context is the originating FileInfo instance.
                    test.equal(true, isNullOrUndefined(error3));
                    test.equal(this.exists, false);

                    this.parent.delete(function (error4) {
                        /* tests here */
                        test.equal(true, isNullOrUndefined(error4));
                        test.equal(this, tmpfile.parent);
                        test.equal(this.exists, false);

                        /* finish here */
                        test.done();
                    });
                });
            });
        });
    },
    'FileInfo-0.1.0-Async': function (test) {
        /* description:  A complex FileInfo create() and delete() asynchronous (async) test.  Testing the FileInfo.create() with varying {opts}.*/

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

            tmpfile.create(opts, function (error1) {
                test.equal(this, tmpfile); // expect 3

                var opts = cb.opts;

                if (opts.ensure) {
                    test.equal(this.exists, true); // expect 2

                    this.delete(function (error2) {
                        test.equal(true, isNullOrUndefined(error2)); // expect 2
                        test.equal(this.exists, false); // expect 2

                        this.parent.delete(function (error3) {
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
    },
    'FileInfo-0.2.0-Async': function (test) {
        /* description:  A FileInfo create() and delete() asynchronous (async) test, with tests on the fileSystemPermissions attribute, where the File and its parent Directory are set to mode 0444.  The file should be deleted, and the parent directory should still maintain its 0444 mode.
        
        /* number of assertions */
        test.expect(11);

        /* setup here */
        var tmpdir = this.tmpdir;

        var tmpfile = new _fsi.FileInfo(_path.join(tmpdir.fullName, 'subdir1', 'tmp.txt'));

        tmpfile.create({ mode: '444', ensure: true }, function (error1) {
            var tmpfileFSPermissions = this.fileSystemPermissions;
            var parentFSPermissions = this.parent.fileSystemPermissions;

            var tmpfileFSPermissionsString = JSON.stringify(tmpfileFSPermissions);
            var parentFSPermissionsString = JSON.stringify(parentFSPermissions);

            test.equal(true, isNullOrUndefined(error1));
            test.equal(this, tmpfile); // ensure that `this` context is the originating FileInfo instance.
            test.equal(this.getType(), 'FileInfo');
            test.equal(this.flags.isFile, true);
            test.equal(this.exists, true);
            test.equal(tmpfileFSPermissionsString, parentFSPermissionsString);
            test.equal(tmpfileFSPermissions.octalFileSystemModeString, '0444');

            this.delete(function (error2) {
                test.equal(this, tmpfile); // ensure that `this` context is the originating FileInfo instance.
                test.equal(true, isNullOrUndefined(error2));
                test.equal(this.exists, false);

                test.equal(this.parent.fileSystemPermissions.octalFileSystemModeString, '0444');

                /* finish here */
                test.done();
            });
        });
    }
};

exports.nodeFsFileSystemInfoSync = {
    setUp: function (done) {
        /*
         *  IMPORTANT NOTE REGARDING TESTS:
         *  Any content (files and/or directories) generated within a test should be created in the ./tmp directory.
         *  The content generated from a test should be cleaned up (deleted) just prior to calling test.done().
         *  The file .tmp/.gitignore must not be removed.
         */

        /* setup here */
        var tmpdir = this.tmpdir = new _fsi.DirectoryInfo('./tmp'); // sandbox for directory / file testing.  The contents of this directory are not safe, as they are removed upon testing.

        if (!tmpdir.exists) { throw 'project/tmp directory does not exist'; }

        cleanDirectorySync(tmpdir);

        /* begin tests */
        done();
    },
    tearDown: function (done) {
        /* teardown here */

        /* clean all existing content inside the tmp directory */
        var tmpdir = this.tmpdir;

        cleanDirectorySync(tmpdir);

        done();
    },

    'DirectoryInfo': function (test) {
        /* description:  A simple DirectoryInfo construction / property tests. */

        /* number of assertions */
        test.expect(4);

        /* setup here */
        var dinfo = new _fsi.DirectoryInfo('0');

        /* tests here */
        test.equal(dinfo.getType(), 'DirectoryInfo');
        test.equal(dinfo.fullName.indexOf(process.cwd()), 0, 'construction test');
        test.equal(dinfo.flags.isDirectory, false); // flags.isDirectory is false since this directory doesn't exist.
        test.equal(dinfo.exists, false);

        /* finish here */
        test.done();
    },
    'DirectoryInfo-0.0.0-Sync': function (test) {
        /* description: simple DirectoryInfo createSubdirectorySync() test.*/

        /* number of assertions */
        test.expect(10);

        /* setup here */
        var tmpsubdir1 = this.tmpdir.createSubdirectorySync('subdir1');

        var tmpsubdir2 = new _fsi.DirectoryInfo(_path.join(this.tmpdir.fullName, 'subdir2')).createSync('777');

        /* tests here */
        test.equal(tmpsubdir1.getType(), 'DirectoryInfo');
        test.equal(tmpsubdir2.getType(), 'DirectoryInfo');

        test.equal(tmpsubdir1.flags.isDirectory, true);
        test.equal(tmpsubdir2.flags.isDirectory, true);

        test.equal(tmpsubdir1.exists, true);  // The check for .exists is intentionally placed after the flags.isDirectory check above, since exists will cause an internal Refresh() of the object, and we want to know that the flags are being set properly upon initialization.  CMC 2015-01-22 10:23:17 AM
        test.equal(tmpsubdir2.exists, true);

        tmpsubdir1.deleteSync(true);
        tmpsubdir2.deleteSync(true);

        test.equal(tmpsubdir1.exists, false);
        test.equal(tmpsubdir2.exists, false);

        test.equal(tmpsubdir1.flags.isDirectory, true);  // The post-delete check for flags.isDirectory is intentionally placed after the .exists check above, since exists will cause an internal Refresh() of the object, and we want to know that the flags are maintained after deletion.  CMC 2015-01-22 10:25:50 AM
        test.equal(tmpsubdir2.flags.isDirectory, true);

        /* finish here */
        test.done();
    },
    'DirectoryInfo-0.1.0-Sync': function (test) {
        /* description:  A simple DirectoryInfo createSubdirectorySync() test.  In this test, ./tmp/subdir1 should already exist from the previous test.*/

        /* number of assertions */
        test.expect(3);

        /* setup here */
        var tmpsubdir1 = this.tmpdir.createSubdirectorySync('subdir1');

        var tmpsubdir2 = this.tmpdir.createSubdirectorySync('subdir1/subdir2\\subdir3/last dir');

        /* tests here */
        test.equal(tmpsubdir1.exists, true);
        test.equal(tmpsubdir2.name, 'last dir');

        tmpsubdir1.deleteSync(true);

        test.equal(tmpsubdir1.exists, false);

        /* finish here */
        test.done();
    },
    'DirectoryInfo-0.2.0-Sync': function (test) {
        /* description:  A simple DirectoryInfo createSync(), deleteSync(), and property test(s) with tests on the fileSystemPermissions attribute.*/

        /* number of assertions */
        test.expect(4);

        /* setup here */
        var tmpdir = this.tmpdir;
        var tmpsubdir1 = tmpdir.createSubdirectorySync('subdir1', '777');

        var tmpsubdir1FSPermissions = tmpsubdir1.fileSystemPermissions;

        /* tests here */
        test.equal(tmpsubdir1.exists, true);

        test.equal(tmpsubdir1FSPermissions.octalFileSystemModeString, '0777');

        tmpsubdir1.deleteSync(true);

        test.equal(tmpsubdir1.exists, false);

        test.equal(tmpsubdir1.parent.fullName, tmpdir.fullName); // Note that while tmpsubdir1.parent and this.tmpdir.fullName are equivalent, but they are not equal (i.e. they are not the same object).

        /* finish here */
        test.done();
    },
    'DirectoryInfo-0.3.0-Sync': function (test) {
        /* description:  A complex DirectoryInfo enumerateFileSystemInfosSync() test.*/

        /* number of assertions */
        test.expect(7);

        /* setup here */
        var tmpdir = this.tmpdir,
            tmpfileCount = 10,
            tmpsubdir1 = tmpdir.createSubdirectorySync('subdir1'),
            tmpsubdir2 = tmpdir.createSubdirectorySync('subdir2'),
            tmpsubdir3 = tmpdir.createSubdirectorySync('subdir3/subdir4/subdir5'),
            tmpfilesArr = [];

        for (var i = 0; i < tmpfileCount; i++) {
            var tmpfileName = 'x'.repeat(i + 1) + '.tmp.txt';

            var tmpfile = new _fsi.FileInfo(_path.join(tmpsubdir1.fullName, tmpfileName));

            if (i % 2 === 0) { tmpfile.createSync({ mode: '777', ensure: false }); } else { tmpfile.createSync({ mode: '400', ensure: false }); } // mode 400 is read only mode

            tmpfilesArr.push(tmpfile);
        }

        var tmpdirContentsArr = tmpdir.enumerateFileSystemInfosSync({ fnFilter: function (fsname) { return (fsname !== '.gitignore'); }, recursive: true });

        /* tests here */
        test.equal(tmpsubdir1.exists, true);
        test.equal(tmpsubdir2.exists, true);
        test.equal(tmpsubdir3.exists, true);
        test.equal(tmpdirContentsArr.length, tmpfilesArr.length + 5);

        tmpsubdir1.deleteSync(true);
        tmpsubdir2.deleteSync(true);

        var tmpsubdir3a = tmpdir.createSubdirectorySync('subdir3'); // TODO:  Change createSubdirectorySync() to GetDirectorySync() (currently using createSubdirectorySync as a shortcut)
        tmpsubdir3a.deleteSync(true);

        test.equal(tmpsubdir1.exists, false);
        test.equal(tmpsubdir2.exists, false);
        test.equal(tmpsubdir3a.exists, false);

        /* finish here */
        test.done();
    },

    'FileInfo': function (test) {
        /* description:  A simple FileInfo construction / property tests. */

        /* number of assertions */
        test.expect(5);

        /* setup here */
        var finfo = new _fsi.FileInfo('0.txt');

        /* tests here */
        test.equal(finfo.getType(), 'FileInfo');
        test.equal(finfo.fullName.indexOf(process.cwd()), 0, 'construction test');
        test.equal(finfo.extension, '.txt');
        test.equal(finfo.flags.isFile, false); // flags.isFile is false since this file doesn't exist.
        test.equal(finfo.exists, false);

        /* finish here */
        test.done();
    },
    'FileInfo-0.0.0-Sync': function (test) {
        /* description: simple FileInfo createSync() and deleteSync() test.*/

        /* number of assertions */
        test.expect(5);

        /* setup here */
        var tmpfile = new _fsi.FileInfo(_path.join(this.tmpdir.fullName, 'tmp.txt'));

        tmpfile.createSync(); // opts default equals { mode: '777', ensure: false, overwrite: true }

        /* tests here */
        test.equal(tmpfile.getType(), 'FileInfo');
        test.equal(tmpfile.flags.isFile, true);
        test.equal(tmpfile.exists, true);

        tmpfile.deleteSync();

        test.equal(tmpfile.exists, false);
        test.equal(tmpfile.flags.isFile, true);

        /* finish here */
        test.done();
    },
    'FileInfo-0.1.0-Sync': function (test) {
        /* description:  A complex FileInfo createSync() and deleteSync() test.  Testing FileInfo.createSync() with varying {opts}.*/

        /* number of assertions */
        test.expect(5);

        /* setup here */
        var tmpdir = this.tmpdir;
        var tmpfile = new _fsi.FileInfo(_path.join(tmpdir.fullName, 'subdir1', 'tmp.txt'));

        /* tests here */
        test.equals(tmpfile.parent.exists, false);
        test.throws(function () { tmpfile.createSync({ mode: '777', ensure: false }); }); // The parent directory does not exist and since `ensure` is false, the file will not be created.
        test.equals(tmpfile.exists, false);

        tmpfile.createSync({ mode: '777', ensure: true }); // The parent directory does not exist however it will be created since `ensure` is true.
        test.equals(tmpfile.exists, true);
        tmpfile.parent.deleteSync(true);

        tmpfile.createSync({ ensure: true }); // Same as above except omitting the `mode` parameter.  The parent directory does not exist however it will be created since `ensure` is true.
        test.equals(tmpfile.exists, true);
        tmpfile.parent.deleteSync(true);

        /* finish here */
        test.done();
    },
    'FileInfo-0.2.0-Sync': function (test) {
        /* description:  A FileInfo createSync() and deleteSync() synchronous test, with tests on the fileSystemPermissions attribute, where the File and its parent Directory are set to mode 0444.  The file should be deleted, and the parent directory should still maintain its 0444 mode.
        
        /* number of assertions */
        test.expect(8);

        /* setup here */
        var tmpdir = this.tmpdir;

        var tmpfile = new _fsi.FileInfo(_path.join(tmpdir.fullName, 'subdir1', 'tmp.txt'));

        tmpfile.createSync({ mode: '444', ensure: true });

        var tmpfileFSPermissions = tmpfile.fileSystemPermissions;
        var parentFSPermissions = tmpfile.parent.fileSystemPermissions;

        var tmpfileFSPermissionsString = JSON.stringify(tmpfileFSPermissions);
        var parentFSPermissionsString = JSON.stringify(parentFSPermissions);

        test.equal(tmpfile.getType(), 'FileInfo');
        test.equal(tmpfile.flags.isFile, true);
        test.equal(tmpfile.exists, true);
        test.equal(tmpfileFSPermissionsString, parentFSPermissionsString);
        test.equal(tmpfileFSPermissions.octalFileSystemModeString, '0444');

        tmpfile.deleteSync();

        test.equal(tmpfile.exists, false);
        test.equal(tmpfile.flags.isFile, true);
        test.equal(parentFSPermissions.octalFileSystemModeString, '0444');

        /* finish here */
        test.done();
    },
    'FileInfo-0.2.1-Sync': function (test) {
        /* description:  A FileInfo createSync() and deleteSync() synchronous test, with tests on the fileSystemPermissions attribute, where the File and its parent Directory are set to mode 0444.  The file should be deleted, and the parent directory should still maintain its 0444 mode.
        
        /* number of assertions */
        test.expect(8);

        /* setup here */
        var tmpdir = this.tmpdir;

        var tmpfile = new _fsi.FileInfo(_path.join(tmpdir.fullName, 'subdir1', 'tmp.txt'));

        tmpfile.createSync({ mode: '777', ensure: true });

        var tmpfileFSPermissions = tmpfile.fileSystemPermissions;
        var parentFSPermissions = tmpfile.parent.fileSystemPermissions;

        var tmpfileFSPermissionsString = JSON.stringify(tmpfileFSPermissions);
        var parentFSPermissionsString = JSON.stringify(parentFSPermissions);

        test.equal(tmpfile.getType(), 'FileInfo');
        test.equal(tmpfile.flags.isFile, true);
        test.equal(tmpfile.exists, true);
        test.equal(tmpfileFSPermissionsString, parentFSPermissionsString);
        test.equal(tmpfileFSPermissions.octalFileSystemModeString, '0777');

        tmpfile.deleteSync();

        test.equal(tmpfile.exists, false);
        test.equal(tmpfile.flags.isFile, true);
        test.equal(parentFSPermissions.octalFileSystemModeString, '0777');

        /* finish here */
        test.done();
    },

    'FileInfo-0.3.0-Sync': function (test) {
        /* description:  A complex FileInfo createSync() and deleteSync() test.  Creating a series of empty files with alternating createSync() `mode` options for creating read-only and non-read-only files.  Also testing enumerateFileSystemInfosSync().*/

        /* number of assertions */
        var tmpfileCount = 10;

        test.expect(tmpfileCount * 3);

        /* setup here */
        var tmpdir = this.tmpdir,
            tmpfilesArr = [];

        for (var i = 0; i < tmpfileCount; i++) {
            var tmpfileName = 'x'.repeat(i + 1) + '.tmp.txt';

            var tmpfile = new _fsi.FileInfo(_path.join(tmpdir.fullName, tmpfileName));

            if (i % 2 === 0) { tmpfile.createSync({ mode: '777', ensure: false }); } else { tmpfile.createSync({ mode: '400', ensure: false }); } // mode 400 is read only mode

            tmpfilesArr.push(tmpfile);
        }

        /* tests here */
        tmpfilesArr.forEach(function (tmpfile) {
            test.equal(tmpfile.exists, true);
        });

        var tmpdirContentsArr = tmpdir.enumerateFileSystemInfosSync({ fnFilter: function (fsname) { return /^x(?:\w+)?\.tmp\.txt$/i.test(fsname); }, recursive: true });
        tmpdirContentsArr.forEach(function (tmpfile) {
            test.equal(tmpfile.exists, true);
        });

        tmpfilesArr.forEach(function (tmpfile) {
            tmpfile.deleteSync();
            test.equal(tmpfile.exists, false);
        });

        /* finish here */
        test.done();
    }
};