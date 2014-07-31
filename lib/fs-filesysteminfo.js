
/*
 * fs-filesysteminfo
 * https://github.com/cookch10/node-fs-filesysteminfo
 *
 * Copyright (c) 2014 Christopher M. Cook
 * Licensed under the MIT license.
 */

(function() {
  var isFunction, isNullOrUndefined, k, namespace, thisNamespaceObjectContainer, toOctalInteger, v, _fs, _path, _root,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _root = typeof exports !== "undefined" && exports !== null ? exports : this;

  _path = require('path');

  _fs = require('fs');

  thisNamespaceObjectContainer = {};

  if (!String.prototype.equals) {
    String.prototype.equals = function(str, ignoreCase) {
      ignoreCase = typeof ignoreCase === 'boolean' ? ignoreCase : false;
      return typeof str === 'string' ? (ignoreCase ? this.toLowerCase() === str.toLowerCase() : this === str) : false;
    };
  }

  isFunction = function(obj) {
    return typeof obj === 'function';
  };

  isNullOrUndefined = function(obj) {
    return typeof obj === 'undefined' || obj === null;
  };

  toOctalInteger = function(obj) {
    var octalInteger;
    if (obj == null) {
      obj = '';
    }
    octalInteger = parseInt(obj, 8);
    if (isNaN(octalInteger)) {
      return null;
    } else {
      return octalInteger;
    }
  };

  namespace = function(target, name, block) {
    var item, key, objectNamespaceContainer, top, value, _i, _len, _ref, _ref1, _results;
    objectNamespaceContainer = (arguments.length === 4 ? Array.prototype.slice.call(arguments).shift() : null);
    if (arguments.length < 3) {
      _ref = [(typeof exports !== 'undefined' ? exports : _root)].concat(__slice.call(arguments)), target = _ref[0], name = _ref[1], block = _ref[2];
    }
    top = target;
    _ref1 = name.split('.');
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      item = _ref1[_i];
      target = target[item] || (target[item] = {});
    }
    block(target, top);
    _results = [];
    for (key in target) {
      if (!__hasProp.call(target, key)) continue;
      value = target[key];
      _results.push(value.prototype.___typeName___ = key);
    }
    return _results;
  };

  namespace(thisNamespaceObjectContainer, 'Util.System.IO', function(exports) {
    exports.Base = (function() {
      function Base() {}

      Base.prototype.GetType = function() {
        return this.___typeName___ || this.constructor.name;
      };

      Base.prototype.toString = function() {
        return this.GetType().toString();
      };

      return Base;

    })();
    exports.FileSystemInfo = (function(_super) {
      __extends(FileSystemInfo, _super);

      function FileSystemInfo(originalPath) {
        var init, _emptyStatusObj, _exists, _extension, _flags, _fullName, _initialized, _name, _originalPath, _status;
        this.originalPath = originalPath;
        this.Refresh = __bind(this.Refresh, this);
        _initialized = false;
        _emptyStatusObj = (function() {
          var DEFAULT_DATETIME_ATTRIBUTE_VALUE, emptyStatsObj, ex, k, kValue;
          DEFAULT_DATETIME_ATTRIBUTE_VALUE = new Date(-11644412400000);
          if (!_initialized) {
            emptyStatsObj = {};
            try {
              emptyStatsObj = _fs.statSync(process.cwd());
            } catch (_error) {
              ex = _error;
              emptyStatsObj = {};
            } finally {
              for (k in emptyStatsObj) {
                kValue = /time$/i.test(k) ? DEFAULT_DATETIME_ATTRIBUTE_VALUE : 0;
                emptyStatsObj[k] = kValue;
              }
            }
            return emptyStatsObj;
          }
        })();
        _originalPath = {
          name: 'originalPath',
          value: this.originalPath
        };
        Object.defineProperty(this, '' + _originalPath.name + '', {
          writable: false,
          value: _originalPath.value.length === 2 && _originalPath.value.charAt(1) === ':' ? '.' : _originalPath.value,
          configurable: false,
          enumerable: true
        });
        this.originalPath = _originalPath.value;
        _fullName = {
          name: 'fullName',
          value: _path.resolve(this.originalPath)
        };
        Object.defineProperty(this, '' + _fullName.name + '', {
          writable: false,
          value: _fullName.value,
          configurable: false,
          enumerable: true
        });
        this.fullName = _fullName.value;
        _name = {
          name: 'name',
          value: _path.basename(this.originalPath)
        };
        Object.defineProperty(this, '' + _name.name + '', {
          writable: false,
          value: _name.value,
          configurable: false,
          enumerable: true
        });
        this.name = _name.value;
        _extension = {
          name: 'extension',
          value: _path.extname(this.originalPath)
        };
        Object.defineProperty(this, '' + _extension.name + '', {
          writable: false,
          value: _extension.value,
          configurable: false,
          enumerable: true
        });
        this.extension = _extension.value;
        _flags = {
          name: 'flags',
          value: {
            isDirectory: false,
            isFile: false,
            isBlockDevice: false,
            isCharacterDevice: false,
            isFIFO: false,
            isSocket: false,
            isSymbolicLink: false
          }
        };
        Object.defineProperty(this, '' + _flags.name + '', {
          writable: false,
          value: _flags.value,
          configurable: false,
          enumerable: true
        });
        this.flags = _flags.value;
        _exists = {
          name: 'exists',
          value: false
        };
        Object.defineProperty(this, '' + _exists.name + '', {
          get: function() {
            this.Refresh(_exists);
            return _exists.value;
          },
          configurable: true,
          enumerable: true
        });
        this.exists = _exists.value;
        _status = {
          name: 'status',
          value: null
        };
        Object.defineProperty(this, '' + _status.name + '', {
          get: function() {
            return _status.value;
          },
          set: function(value) {
            if (value == null) {
              value = _emptyStatusObj;
            }
            return _status.value = value;
          },
          configurable: true,
          enumerable: true
        });
        this.status = _status.value;
        init = ((function(_this) {
          return function() {
            if (!_initialized) {
              _this.Refresh(_exists);
            }
            if (!_initialized) {
              return _initialized = true;
            }
          };
        })(this))();
      }

      FileSystemInfo.prototype.Refresh = function(i) {
        var ex0, ex1, exists, k, kAttrib, parentContentsArr, parentPath;
        if ((i != null ? i.value : void 0) != null) {
          exists = _fs.existsSync(this.fullName);
          if (exists) {
            i.value = true;
          } else {
            i.value = false;
            try {
              parentPath = _path.resolve("" + this.fullName, '..');
              if (!parentPath.equals(this.fullName, true)) {
                parentContentsArr = _fs.readdirSync(parentPath);
                if (parentContentsArr.indexOf(this.name) >= 0) {
                  i.value = true;
                }
              }
            } catch (_error) {
              ex0 = _error;
            }
          }
        }
        try {
          this.status = _fs.statSync(this.fullName);
          for (k in this.flags) {
            kAttrib = this.status[k];
            if (isFunction(kAttrib)) {
              this.flags[k] = kAttrib.apply(this.status);
            }
          }
        } catch (_error) {
          ex1 = _error;
          this.status = null;
        }
      };

      return FileSystemInfo;

    })(exports.Base);
    exports.DirectoryInfo = (function(_super) {
      __extends(DirectoryInfo, _super);

      function DirectoryInfo(originalPath) {
        this.EnumerateFileSystemInfosSync = __bind(this.EnumerateFileSystemInfosSync, this);
        this.CreateSubdirectorySync = __bind(this.CreateSubdirectorySync, this);
        this.DeleteSync = __bind(this.DeleteSync, this);
        this.CreateSync = __bind(this.CreateSync, this);
        var _exists, _parent;
        if (isNullOrUndefined(originalPath) || originalPath.equals('')) {
          throw 'Path is null or undefined';
        }
        DirectoryInfo.__super__.constructor.call(this, originalPath);
        _exists = {
          name: 'exists',
          value: false
        };
        Object.defineProperty(this, '' + _exists.name + '', {
          get: function() {
            this.Refresh(_exists);
            return _exists.value;
          },
          configurable: true,
          enumerable: true
        });
        this.exists = _exists.value;
        _parent = {
          name: 'parent',
          value: null
        };
        Object.defineProperty(this, '' + _parent.name + '', {
          get: function() {
            var parentPath;
            if (isNullOrUndefined(_parent.value)) {
              parentPath = _path.resolve("" + this.fullName, '..');
              _parent.value = new DirectoryInfo(parentPath);
            }
            return _parent.value;
          },
          configurable: true,
          enumerable: true
        });
        this.parent = _parent.value;
      }

      DirectoryInfo.prototype.CreateSync = function(mode) {
        var ex, success;
        mode = toOctalInteger(mode);
        if (!this.parent.exists) {
          this.parent.CreateSync(mode);
        }
        if (!this.exists) {
          success = true;
          try {
            _fs.mkdirSync(this.fullName, mode);
          } catch (_error) {
            ex = _error;
            success = false;
          } finally {
            if (success) {
              this.Refresh();
            } else {
              if (ex) {
                throw ex;
              }
            }
          }
        }
      };

      DirectoryInfo.prototype.DeleteSync = function(recursive) {
        var children;
        recursive = typeof recursive === 'boolean' ? recursive : false;
        if (recursive) {
          children = this.EnumerateFileSystemInfosSync('', false);
          if (children.length === 0) {
            _fs.rmdirSync(this.fullName);
          } else {
            children.forEach(function(fsinfo) {
              var ftype;
              ftype = fsinfo.GetType();
              if (ftype === 'FileInfo' || ftype === 'DirectoryInfo') {
                return fsinfo.DeleteSync(recursive);
              } else {
                throw 'Unhandled exception for DeleteSync of ' + fsinfo.GetType();
              }
            });
            _fs.rmdirSync(this.fullName);
          }
        } else {
          _fs.rmdirSync(this.fullName);
        }
      };

      DirectoryInfo.prototype.CreateSubdirectorySync = function(path, mode) {
        var subdirectory;
        if (isNullOrUndefined(path) || path.equals('')) {
          throw 'Path is null or undefined';
        }
        path = _path.join(this.fullName, path);
        mode = toOctalInteger(mode);
        subdirectory = new DirectoryInfo(path);
        if (!subdirectory.exists) {
          subdirectory.CreateSync(mode);
        }
        return subdirectory;
      };

      DirectoryInfo.prototype.EnumerateFileSystemInfosSync = function(fnSearchFilter, searchSubdirectories) {
        var fileSystemInfosArr, rArg, resultsArr, _fileSystemInfosArr;
        if (!this.exists) {
          throw 'Path does not exist and hence cannot be enumerated';
        }
        if (searchSubdirectories == null) {
          searchSubdirectories = false;
        }
        if (!isFunction(fnSearchFilter)) {
          fnSearchFilter = function() {
            return true;
          };
        }
        rArg = Array.prototype.slice.call(arguments).slice(-1).shift();
        resultsArr = Array.isArray(rArg) ? rArg : [];
        fileSystemInfosArr = [];
        _fileSystemInfosArr = _fs.readdirSync(this.fullName);
        _fileSystemInfosArr.forEach(((function(_this) {
          return function(fsname) {
            var fileSystemInfoObj, path;
            if (fnSearchFilter(fsname)) {
              path = _path.join(_this.fullName, fsname);
              fileSystemInfoObj = new exports.FileSystemInfo(path);
              if (fileSystemInfoObj.flags.isDirectory) {
                fileSystemInfoObj = new DirectoryInfo(path);
              } else if (fileSystemInfoObj.flags.isFile) {
                fileSystemInfoObj = new exports.FileInfo(path);
              }
              return fileSystemInfosArr.push(fileSystemInfoObj);
            }
          };
        })(this)));
        if (searchSubdirectories) {
          fileSystemInfosArr.forEach(function(fsinfo) {
            if (fsinfo.flags.isDirectory) {
              resultsArr = fsinfo.EnumerateFileSystemInfosSync(fnSearchFilter, searchSubdirectories, resultsArr);
            }
          });
        }
        fileSystemInfosArr = fileSystemInfosArr.concat(resultsArr);
        return fileSystemInfosArr;
      };

      return DirectoryInfo;

    })(exports.FileSystemInfo);
    return exports.FileInfo = (function(_super) {
      __extends(FileInfo, _super);

      function FileInfo(originalPath) {
        this.DeleteSync = __bind(this.DeleteSync, this);
        var _exists, _parent;
        if (isNullOrUndefined(originalPath) || originalPath.equals('')) {
          throw 'Path is null or undefined';
        }
        FileInfo.__super__.constructor.call(this, originalPath);
        _exists = {
          name: 'exists',
          value: false
        };
        Object.defineProperty(this, '' + _exists.name + '', {
          get: function() {
            this.Refresh(_exists);
            return _exists.value;
          },
          configurable: true,
          enumerable: true
        });
        this.exists = _exists.value;
        _parent = {
          name: 'parent',
          value: null
        };
        Object.defineProperty(this, '' + _parent.name + '', {
          get: function() {
            var parentPath;
            if (isNullOrUndefined(_parent.value)) {
              parentPath = _path.resolve("" + this.fullName, '..');
              _parent.value = new exports.DirectoryInfo(parentPath);
            }
            return _parent.value;
          },
          configurable: true,
          enumerable: true
        });
        this.parent = _parent.value;
      }

      FileInfo.prototype.DeleteSync = function() {
        _fs.unlinkSync(this.fullName);
      };

      return FileInfo;

    })(exports.FileSystemInfo);
  });

  for (k in thisNamespaceObjectContainer) {
    v = thisNamespaceObjectContainer[k];
    return _root[k] = v;
  }

}).call(this);
