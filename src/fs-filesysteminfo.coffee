###
 * fs-filesysteminfo
 * https://github.com/cookch10/node-fs-filesysteminfo
 *
 * Copyright (c) 2014 Christopher M. Cook
 * Licensed under the MIT license.
###

_root = exports ? this
_path = require('path')
_fs = require('fs')
thisNamespaceObjectContainer = {}

#region ************* internal lib:  extension methods ********************
unless String::equals
    String::equals = (str, ignoreCase) ->
        `ignoreCase = (ignoreCase === undefined ? false : typeof ignoreCase === 'boolean' ? ignoreCase : false)`
        `typeof str === 'string' ? (ignoreCase ? this.toLowerCase() === str.toLowerCase() : this === str) : false`
#endregion
#region ************* internal lib:  utility methods   ********************
isFunction = (obj) ->
    typeof obj is 'function'

isNullOrUndefined = (obj) ->
    typeof obj is 'undefined' or obj is null

toOctalInteger = (obj) ->
    obj ?= ''
    octalInteger = parseInt(obj, 8)
    if isNaN(octalInteger) then null else octalInteger

namespace = (target, name, block) ->
    objectNamespaceContainer = (if arguments.length is 4 then Array::slice.call(arguments).shift() else null)
    [target, name, block] = [(if typeof exports isnt 'undefined' then exports else _root), arguments...] if arguments.length < 3
    top = target
    target = target[item] or= {} for item in name.split '.'
    block target, top
    for own key, value of target
        value::___typeName___ = key
#endregion

namespace thisNamespaceObjectContainer, 'Util.System.IO', (exports) ->
    class exports.Base
        GetType: -> @___typeName___ or @constructor.name
        toString: ->
            @GetType().toString()

    class exports.FileSystemInfo extends exports.Base
        constructor: (@originalPath) ->
            _initialized = false
            _emptyStatusObj = (->
                #If the path used to construct the FileSystemInfo object does not exist, all time-related status attributes will be set to 12:00 midnight, January 1, 1601 A.D. (C.E.) Coordinated Universal Time (UTC), adjusted to local time.
                DEFAULT_DATETIME_ATTRIBUTE_VALUE = new Date(-11644412400000)
                
                if not _initialized
                    emptyStatsObj = {}
                    try
                        emptyStatsObj = _fs.statSync(process.cwd())
                    catch ex
                        emptyStatsObj = {}
                    finally
                        for k of emptyStatsObj
                            kValue = if (/time$/i).test(k) then DEFAULT_DATETIME_ATTRIBUTE_VALUE else 0
                            emptyStatsObj[k] = kValue
                    emptyStatsObj
            )()
            
            _originalPath = {name: 'originalPath', value: @originalPath}
            Object.defineProperty @, '' + _originalPath.name + '',
                writable: false #When the writable property attribute is set to false, the property is said to be 'non-writable'. It cannot be reassigned.
                value: `_originalPath.value.length === 2 && _originalPath.value.charAt(1) === ':' ? '.' : _originalPath.value`
                configurable: false #true if and only if the type of this property descriptor may be changed and if the property may be deleted from the corresponding object.  Defaults to false.
                enumerable: true #true if and only if this property shows up during enumeration of the properties on the corresponding object.  Defaults to false.
            @originalPath = _originalPath.value
            
            _fullName = {name: 'fullName', value: _path.resolve(@originalPath)}
            Object.defineProperty @, '' + _fullName.name + '',
                writable: false
                value: _fullName.value
                configurable: false
                enumerable: true
            @fullName = _fullName.value
            
            _name = {name: 'name', value: _path.basename(@originalPath)}
            Object.defineProperty @, '' + _name.name + '',
                writable: false
                value: _name.value
                configurable: false
                enumerable: true
            @name = _name.value
            
            _extension = {name: 'extension', value: _path.extname(@originalPath)}
            Object.defineProperty @, '' + _extension.name + '',
                writable: false
                value: _extension.value
                configurable: false
                enumerable: true
            @extension = _extension.value
            
            _flags = {name: 'flags', value: {
                isDirectory: false,
                isFile: false,
                isBlockDevice: false,
                isCharacterDevice: false,
                isFIFO: false,
                isSocket: false,
                isSymbolicLink: false
            }}
            Object.defineProperty @, '' + _flags.name + '',
                writable: false
                value: _flags.value
                configurable: false
                enumerable: true
            @flags = _flags.value
            
            _exists = {name: 'exists', value: false}
            Object.defineProperty @, '' + _exists.name + '',
                get: ->
                    @Refresh(_exists)
                    _exists.value
                configurable: true
                enumerable: true
            @exists = _exists.value
            
            _status = {name: 'status', value: null}
            Object.defineProperty @, '' + _status.name + '',
                get: ->
                    _status.value
                set: (value) ->
                    value ?= _emptyStatusObj
                    _status.value = value
                configurable: true
                enumerable: true
            @status = _status.value
            
            init = (=>
                @Refresh(_exists) if not _initialized
                _initialized = true if not _initialized
            )()
        
        Refresh: (i) =>
            if i?.value?
                exists = _fs.existsSync(@fullName)
                if exists
                    i.value = true
                else
                    try
                        parentPath = _path.resolve("#{@fullName}", '..')
                        if not parentPath.equals(@fullName, true)
                            parentContentsArr = _fs.readdirSync(parentPath)
                            i.value = true if parentContentsArr.indexOf(@name) >= 0
                    catch ex0
            try
                @status = _fs.statSync(@fullName)
                for k of @flags
                    kAttrib = @status[k]
                    @flags[k] = kAttrib.apply(@status) if isFunction(kAttrib)
            catch ex1
                @status = null
            return

    class exports.DirectoryInfo extends exports.FileSystemInfo
        constructor: (originalPath) ->
            throw 'Path is null or undefined' if isNullOrUndefined(originalPath) or originalPath.equals('')
            super(originalPath)
            
            _parent = {name: 'parent', value: null}
            Object.defineProperty @, '' + _parent.name + '',
                get: ->
                    if isNullOrUndefined(_parent.value)
                        parentPath = _path.resolve("#{@fullName}", '..')
                        _parent.value = new DirectoryInfo(parentPath) 
                    _parent.value
                configurable: true
                enumerable: true
            @parent = _parent.value
        
        Create: (mode) =>
            mode = toOctalInteger(mode)
            if not @exists
                success = true
                try
                    _fs.mkdirSync(@fullName, mode)
                catch ex
                    success = false
                finally
                    if success
                        @Refresh()
                    else
                        throw ex if ex
            return
        
        CreateSubdirectory: (path, mode) =>
            throw 'Path is null or undefined' if isNullOrUndefined(path) or path.equals('')
            path = _path.join(@fullName, path)
            mode = toOctalInteger(mode)
            subdirectory = new DirectoryInfo(path)
            subdirectory.Create(mode) if not subdirectory.exists
            subdirectory
        
        EnumerateFileSystemInfos: (fnSearchFilter, searchSubdirectories) =>
            throw 'Path does not exist and hence cannot be enumerated' if not @exists
            searchSubdirectories ?= false
            if not isFunction(fnSearchFilter) then fnSearchFilter = () -> true
            
            rArg = Array::slice.call(arguments).slice(-1).shift()
            resultsArr = if Array.isArray(rArg) then rArg else []
            
            fileSystemInfosArr = []
            
            _fileSystemInfosArr = _fs.readdirSync(@fullName)
            
            _fileSystemInfosArr.forEach((fsname) =>
                if fnSearchFilter(fsname)
                    path = _path.join(@fullName, fsname)
                    fileSystemInfoObj = new exports.FileSystemInfo(path)
                    if (fileSystemInfoObj.flags.isDirectory)
                        fileSystemInfoObj = new DirectoryInfo(path)
                    else if (fileSystemInfoObj.flags.isFile)
                        fileSystemInfoObj = new exports.FileInfo(path)
                    fileSystemInfosArr.push(fileSystemInfoObj)
            )
            
            if searchSubdirectories
                fileSystemInfosArr.forEach (fsinfo) ->
                    if fsinfo.flags.isDirectory
                        resultsArr = fsinfo.EnumerateFileSystemInfos(fnSearchFilter, searchSubdirectories, resultsArr)
                        return
            
            fileSystemInfosArr = fileSystemInfosArr.concat(resultsArr)
            
            fileSystemInfosArr

    class exports.FileInfo extends exports.FileSystemInfo
        constructor: (originalPath) ->
            throw 'Path is null or undefined' if isNullOrUndefined(originalPath) or originalPath.equals('')
            super(originalPath)
            
            _parent = {name: 'parent', value: null}
            Object.defineProperty @, '' + _parent.name + '',
                get: ->
                    if isNullOrUndefined(_parent.value)
                        parentPath = _path.resolve("#{@fullName}", '..')
                        _parent.value = new exports.DirectoryInfo(parentPath) 
                    _parent.value
                configurable: true
                enumerable: true
            @parent = _parent.value

return _root[k] = v for k, v of thisNamespaceObjectContainer
