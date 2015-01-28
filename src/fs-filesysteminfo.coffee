###
 *  fs-filesysteminfo
 *  https://github.com/cookch10/node-fs-filesysteminfo
 *
 *  Copyright (c) 2015 Christopher M. Cook
 *  Licensed under the MIT license.
###

_root = exports ? this
_path = require('path')
_fs = require('fs')
_exec = require('child_process').exec
_child = null

oldmask = undefined
newmask = 0
oldmask = process.umask(newmask)

thisNamespaceObjectContainer = {}

#region ************* internal lib:  extension methods ********************
unless String::equals
    String::equals = (str, ignoreCase) ->
        ignoreCase = if typeof ignoreCase is 'boolean' then ignoreCase else false
        `typeof str === 'string' ? (ignoreCase ? this.toLowerCase() === str.toLowerCase() : this === str) : false`
#endregion
#region ************* internal lib:  utility methods   ********************
isObject = (obj) ->
    typeof obj is 'object'
    
isFunction = (obj) ->
    typeof obj is 'function'

isBoolean = (obj) ->
    typeof obj is 'boolean'

isString = (obj) ->
    typeof obj is 'string'

isNullOrUndefined = (obj) ->
    typeof obj is 'undefined' or obj is null

toIntegerFromOctalRepresenation = (obj) ->
    obj ?= ''
    integerFromOctal = parseInt(obj, 8)
    if isNaN(integerFromOctal) then null else integerFromOctal

toOctalStringFromIntegerRepresenation = (obj) ->
    obj ?= ''
    octalStringFromInteger = '0' + (obj & parseInt('07777', 8)).toString(8)
    if octalStringFromInteger is '00' then '' else octalStringFromInteger

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
    DEFAULT_FILESYSTEM_CREATION_MODE = '777'

    class exports.Base
        getType: -> @___typeName___ or @constructor.name
        toString: ->
            @getType().toString()

    class FileSystemPermissions extends exports.Base
        constructor: (@octalFileSystemModeString = '') ->
            CONST_LETTERFORMAT_ARR = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx']
            
            CONST_BINARYFORMAT_ARR = ['000', '001', '010', '011', '100', '101', '110', '111']
            
            fnGetPermissionObj = (intPermissionString) ->
                intPermission = parseInt(intPermissionString) or 0

                defaultObj = { canRead: false, canWrite: false, canExecute: false, letterFormat: CONST_LETTERFORMAT_ARR[intPermission], binaryFormat: CONST_BINARYFORMAT_ARR[intPermission] }
                
                if intPermission
                    switch intPermission
                        when 7
                            defaultObj.canRead = true
                            defaultObj.canWrite = true
                            defaultObj.canExecute = true
                        
                        when 6
                            defaultObj.canRead = true
                            defaultObj.canWrite = true
                        
                        when 5
                            defaultObj.canRead = true
                            defaultObj.canExecute = true
                        
                        when 4
                            defaultObj.canRead = true
                        
                        when 3
                            defaultObj.canWrite = true
                            defaultObj.canExecute = true
                        
                        when 2
                            defaultObj.canWrite = true
                        
                        when 1
                            defaultObj.canExecute = true
                        
                        else
                
                Object.freeze(defaultObj)
            
            _owner = {name: 'owner', value: fnGetPermissionObj()}
            Object.defineProperty @, '' + _owner.name + '',
                get: ->
                    _owner.value
                configurable: true
                enumerable: true
            @owner = _owner.value
            
            _group = {name: 'group', value: fnGetPermissionObj()}
            Object.defineProperty @, '' + _group.name + '',
                get: ->
                    _group.value
                configurable: true
                enumerable: true
            @group = _group.value
            
            _otherUsers = {name: 'otherUsers', value: fnGetPermissionObj()}
            Object.defineProperty @, '' + _otherUsers.name + '',
                get: ->
                    _otherUsers.value
                configurable: true
                enumerable: true
            @otherUsers = _otherUsers.value

            updateRolePermissions = (octalString) ->
                octalString = if octalString then octalString.toString() else '000'
                
                octalString = if octalString.length is 4 then octalString.substring(1) else octalString
                
                octalArr = octalString.split('')
                
                for octal, i in octalArr
                    role = if i is 0 then _owner else if i is 1 then _group else _otherUsers
                    
                    permission = fnGetPermissionObj(octal)
                    
                    role.value = permission
                
                octalString
                
            _octalFileSystemModeString = {name: 'octalFileSystemModeString', value: @octalFileSystemModeString}
            Object.defineProperty @, '' + _octalFileSystemModeString.name + '',
                get: ->
                    _octalFileSystemModeString.value
                set: (value) ->
                    _value = if value and isString(value) and /^(?:0|0?[0-7]{3})$/g.test(value) then value else ''
                    
                    updateRolePermissions(_value)
                    
                    _octalFileSystemModeString.value = value
                configurable: true
                enumerable: true
            @octalFileSystemModeString = _octalFileSystemModeString.value

        toRoleLetterRepresentationString: ->
            @owner.letterFormat + @group.letterFormat + @otherUsers.letterFormat
        
        toRoleBinaryRepresentationString: ->
            @owner.binaryFormat + @group.binaryFormat + @otherUsers.binaryFormat

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
            
            _fileSystemPermissions = {name: 'fileSystemPermissions', value: new FileSystemPermissions()}
            Object.defineProperty @, '' + _fileSystemPermissions.name + '',
                get: ->
                    _fileSystemPermissions.value
                configurable: true
                enumerable: true
            @fileSystemPermissions = _fileSystemPermissions.value
            
            _exists = {name: 'exists', value: false}
            Object.defineProperty @, '' + _exists.name + '',
                get: ->
                    @refresh(_exists)
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
            
            init = (->
                @refresh(_exists) if not _initialized
                _initialized = true if not _initialized
            ).apply(@)
        
        refresh: (i) =>
            if i?.value?
                exists = _fs.existsSync(@fullName)
                
                if exists
                    i.value = true
                else
                    i.value = false
                    
                    try
                        parentPath = _path.resolve("#{@fullName}", '..')
                        if not parentPath.equals(@fullName, true)
                            parentContentsArr = _fs.readdirSync(parentPath)
                            i.value = true if parentContentsArr.indexOf(@name) >= 0
                    catch ex0
            try
                status = @status = _fs.statSync(@fullName)
                
                isWin = process.platform is 'win32'
                
                isFile = status.isFile()
                
                mode = status.mode
                
                if isWin then mode = mode | ((mode & 146) >> 1) # workaround for Windows OS permissions issues, see https://github.com/joyent/node/issues/4812 and https://github.com/joyent/node/issues/6381
                
                fnContinue = ((error, stdout, stderr) ->
                    fsPermissions = @fileSystemPermissions
                    
                    flags = @flags
                    
                    status = @status
                    
                    parent = @parent
                    
                    parentFSPermissions = parent?.fileSystemPermissions
                    
                    parentFSPermissionsOctalFileSystemModeString = if parentFSPermissions then parentFSPermissions.octalFileSystemModeString else ''
                    
                    if arguments.length is 3
                        fsPermissions.octalFileSystemModeString = '0' + stdout.trim() unless error
                    else
                        fsPermissions.octalFileSystemModeString = toOctalStringFromIntegerRepresenation(error)
                    
                    for k of flags
                        kAttrib = status[k]
                        flags[k] = kAttrib.apply(status) if isFunction(kAttrib)
                    
                    if parent and not parentFSPermissionsOctalFileSystemModeString
                        parent.refresh()
                    
                    @
                ).bind(@)
                
                if !mode
                    _child = _exec('stat -c "%a" ' + @parent.fullName, fnContinue)
                else
                    fnContinue(mode)
            
            catch ex1
                @status = null
            return

    class exports.DirectoryInfo extends exports.FileSystemInfo
        constructor: (originalPath) ->
            throw 'Path is null or undefined' if isNullOrUndefined(originalPath) or originalPath.equals('')
            super(originalPath)
            
            _exists = {name: 'exists', value: false}
            Object.defineProperty @, '' + _exists.name + '',
                get: ->
                    @refresh(_exists)
                    _exists.value
                configurable: true
                enumerable: true
            @exists = _exists.value
            
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
        
        create: (mode..., cb) =>
            if not @parent.exists then @parent.create(mode, cb)
            
            if not @exists
                _fs.mkdir @fullName, toIntegerFromOctalRepresenation(mode), ((error) ->
                    if isNullOrUndefined(error) then @refresh()
                    
                    return cb.call(@, error, @) if isFunction(cb)
                ).bind(@)
            else
                return cb.call(@, null, @) if isFunction(cb)
            return
        
        createSync: (mode) =>
            if not @parent.exists then @parent.createSync(mode)
            
            if not @exists
                success = true
                
                try
                    _fs.mkdirSync(@fullName, toIntegerFromOctalRepresenation(mode))
                catch ex
                    success = false
                finally
                    if success
                        @refresh()
                    else
                        throw ex if ex
            return @
        
        createSubdirectory: (path, mode..., cb) =>
            throw 'Path is null or undefined' if isNullOrUndefined(path) or path.equals('')
            
            path = _path.join(@fullName, path)
            
            mode = if Array.isArray then mode[0] else mode
            
            subdirectory = new DirectoryInfo(path)
            
            if not subdirectory.exists
                subdirectory.create mode, ((context, error, result) ->
                    if context is result
                        return cb.call(this, error, result) if isFunction(cb)
                    else
                        return result
                ).bind(@, subdirectory)
            else
                cb.call(@, null, subdirectory) if isFunction(cb)
            return
        
        createSubdirectorySync: (path, mode) =>
            throw 'Path is null or undefined' if isNullOrUndefined(path) or path.equals('')
            
            path = _path.join(@fullName, path)
            
            subdirectory = new DirectoryInfo(path)
            
            subdirectory.createSync(mode) if not subdirectory.exists
            
            subdirectory
        
        'delete': (recursive = false, cb) =>
            if arguments.length is 1
                rArg = Array::slice.call(arguments).slice(-1).shift()
                
                if isFunction(rArg)
                    recursive = false
                    cb = rArg
            
            recursive = if isBoolean(recursive) then recursive else false
            
            fnFilter = if recursive then null else -> false
            
            self = @
            
            fnIterator = ((dir, done) ->
                context = @
                
                results = []
                
                context.enumerateFileSystemInfos({ fnFilter: fnFilter, recursive: recursive }, (error1, list) ->
                    return done.call(self, error1) if error1
                    
                    ### 
                    *   NOTE:
                    *   A big assumption is being made here in that we assume directories will always appear ahead of files in the array from enumerateFileSystemInfos().
                    *   To prevent exceptions from being thrown by attempting to delete a non-empty directory, we are going to reverse() the array before continuing.
                    *   This means all files will be deleted ahead of their respective parent directories.
                    *   This also means that all subdirectories will be deleted ahead of their parent directories.
                    *
                    *   **If this assumption proves false (possibly for other operating systems), this method logic can be revisited.
                    *   
                    *       **Possible alternative logic (just putting here for note purposes)
                    *       -> One alternative (which I am not sure I like) would be to perform an array.sort(), which might be more expensive resource-wise.
                    *       -> Another alternative would be to queue directories during iteration to be deleted after all files have been deleted.
                    *       -> Something better than the previous two.
                    ###
                    
                    list.reverse().push(self)
                    
                    i = 0
                    
                    (next = ->
                        fsinfo = list[i++]
                        
                        return done.call(self, null) unless fsinfo
                        
                        _fs.chmod fsinfo.fullName, toIntegerFromOctalRepresenation('777'), ((error2) ->
                            return done.call(self, error2) if error2
                            
                            ftype = @getType()
                            
                            if ftype is 'FileSystemInfo' then @refresh()
                            
                            if ftype is 'FileInfo' or ftype is 'DirectoryInfo'
                                fsMethod = _fs[if ftype is 'FileInfo' then 'unlink' else 'rmdir']
                                
                                fsMethod.call @, @fullName, ((error3) ->
                                    return done.call(self, error3) if error3
                                    
                                    return next.call(@)
                                )
                            else
                                return done('Unhandled exception for delete of ambiguous ' + ftype) # This could happen in some edge cases where I specific file or directory has non-read permissions, but was found to exist by looking at the parent directory contents.
                        ).bind(fsinfo)
                    ).call(context)
                    return
                )
                return
            )
            
            fnIterator.call(@, @fullName, cb)
        
        deleteSync: (recursive) =>
            recursive = if isBoolean(recursive) then recursive else false
            
            _fs.chmodSync(@fullName, toIntegerFromOctalRepresenation('777'))
            
            if recursive
                children = @enumerateFileSystemInfosSync({ fnFilter: null, recursive: false })
                if (children.length is 0)
                    _fs.rmdirSync(@fullName)
                else
                    children.forEach (fsinfo) ->
                        ftype = fsinfo.getType()
                        
                        if ftype is 'FileSystemInfo' then fsinfo.refresh()
                        
                        if ftype is 'FileInfo' or ftype is 'DirectoryInfo'
                            fsinfo.deleteSync(recursive)
                        else
                            throw 'Unhandled exception for deleteSync of ambiguous ' + ftype # This could happen in some edge cases where I specific file or directory has non-read permissions, but was found to exist by looking at the parent directory contents.
                    _fs.rmdirSync(@fullName)
            else
                _fs.rmdirSync(@fullName) # this will (and should) throw an exception if the directory is not empty.  To delete a non-empty directory, set recursive equal to true.
            return
        
        enumerateFileSystemInfos: (opts = {}, cb) =>
            if arguments.length is 1 and isFunction(opts)
                cb = opts
                opts = {}
            
            return cb('Invalid opts argument') if not isObject(opts)
            
            defaultfnFilter = -> true
            
            opts.fnFilter ?= defaultfnFilter
            
            opts.recursive ?= false
            
            recursive = if isBoolean(opts.recursive) then opts.recursive else false
            
            fnFilter = if isFunction(opts.fnFilter) then opts.fnFilter else defaultfnFilter
            
            fileSystemInfosArr = []
            
            self = @
            
            fnIterator = ((dir, done) ->
                context = @
                
                _fs.readdir dir, ((error, list) ->
                    return done.call(self, error) if error
                    
                    i = 0
                    
                    (next = ->
                        fsname = list[i++]
                        
                        return done.call(self, null, fileSystemInfosArr) unless fsname
                        
                        if fnFilter(fsname)
                            path = _path.join(context.fullName, fsname)
                            
                            fileSystemInfoObj = new exports.FileSystemInfo(path)
                            
                            isDirectory = fileSystemInfoObj.flags.isDirectory
                            
                            isFile = fileSystemInfoObj.flags.isFile
                            
                            if (isDirectory)
                                fileSystemInfoObj = new DirectoryInfo(path)
                            
                            else if (isFile)
                                fileSystemInfoObj = new exports.FileInfo(path)
                            
                            fileSystemInfosArr.push(fileSystemInfoObj)
                            
                            if (recursive and isDirectory)
                                fnIterator.call fileSystemInfoObj, fileSystemInfoObj.fullName, (error, results) ->
                                    next.call(fileSystemInfoObj)
                                return
                            else
                                next.call(context)
                        else
                            next.call(context)
                    ).call(context)
                    return
                ).bind(context)
                return
            )
            
            fnIterator.call(@, @fullName, cb)
        
        enumerateFileSystemInfosSync: (opts = {}) =>
            throw 'Path does not exist and hence cannot be enumerated' if not @exists
            
            throw 'Invalid opts argument' if not isObject(opts)
            
            defaultfnFilter = -> true
            
            opts.fnFilter ?= defaultfnFilter
            
            opts.recursive ?= false
            
            recursive = if isBoolean(opts.recursive) then opts.recursive else false
            
            fnFilter = if isFunction(opts.fnFilter) then opts.fnFilter else defaultfnFilter
            
            rArg = Array::slice.call(arguments).slice(-1).shift()
            
            resultsArr = if Array.isArray(rArg) then rArg else []
            
            fileSystemInfosArr = []
            
            _fileSystemInfosArr = _fs.readdirSync(@fullName)
            
            _fileSystemInfosArr.forEach ((fsname) =>
                if fnFilter(fsname)
                    path = _path.join(@fullName, fsname)
                    fileSystemInfoObj = new exports.FileSystemInfo(path)
                    if (fileSystemInfoObj.flags.isDirectory)
                        fileSystemInfoObj = new DirectoryInfo(path)
                    
                    else if (fileSystemInfoObj.flags.isFile)
                        fileSystemInfoObj = new exports.FileInfo(path)
                    
                    fileSystemInfosArr.push(fileSystemInfoObj)
            )
            
            if recursive
                fileSystemInfosArr.forEach (fsinfo) ->
                    if fsinfo.flags.isDirectory
                        resultsArr = fsinfo.enumerateFileSystemInfosSync(opts, resultsArr)
                        return
            
            fileSystemInfosArr = fileSystemInfosArr.concat(resultsArr)
            
            fileSystemInfosArr

    class exports.FileInfo extends exports.FileSystemInfo
        constructor: (originalPath) ->
            throw 'Path is null or undefined' if isNullOrUndefined(originalPath) or originalPath.equals('')
            super(originalPath)
            
            _exists = {name: 'exists', value: false}
            Object.defineProperty @, '' + _exists.name + '',
                get: ->
                    @refresh(_exists)
                    _exists.value
                configurable: true
                enumerable: true
            @exists = _exists.value
            
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
        
        create: (opts = {}, cb) =>
            if arguments.length is 1 and isFunction(opts)
                cb = opts
                opts = {}
            
            return cb('Invalid opts argument') if not isObject(opts)
            
            opts.ensure ?= false
            
            opts.mode ?= ''
            
            opts.overwrite ?= true
            
            ensure = if isBoolean(opts.ensure) then opts.ensure else false
            
            mode = opts.mode
            
            modeOctal = toIntegerFromOctalRepresenation(mode)
            
            overwrite = if isBoolean(opts.overwrite) then opts.overwrite else true
            
            writeflag = if overwrite then 'w' else 'wx'
            
            ensureCreateParent = false
            
            fnContinue = ((error) ->
                _fs.writeFile @fullName, '', { encoding: 'utf8', mode: modeOctal, flag: writeflag }, ((error) -> # note that since the file contains zero bytes, the encoding doesn't actually matter at this point.
                    if isNullOrUndefined(error) then @refresh()
                    
                    if ensureCreateParent
                        _fs.chmod @parent.fullName, toIntegerFromOctalRepresenation(mode || DEFAULT_FILESYSTEM_CREATION_MODE), ((error) ->
                            @parent.refresh()
                            
                            return cb.call(@, error) if isFunction(cb)
                        ).bind(@)
                    else
                        return cb.call(@, error) if isFunction(cb)
                ).bind(@)
            ).bind(@)
            
            if ensure and not @parent.exists
                ensureCreateParent = true
                
                @parent.create('777', cb, fnContinue)
            else
                fnContinue()
            return
        
        createSync: (opts = {}) =>
            throw 'Invalid opts argument' if not isObject(opts)
            
            opts.ensure ?= false
            
            opts.mode ?= ''
            
            opts.overwrite ?= true
            
            ensure = if isBoolean(opts.ensure) then opts.ensure else false
            
            mode = opts.mode
            
            modeOctal = toIntegerFromOctalRepresenation(mode)
            
            overwrite = if isBoolean(opts.overwrite) then opts.overwrite else true
            
            writeflag = if overwrite then 'w' else 'wx'
            
            ensureCreateParent = false
            
            success = true
            
            if ensure and not @parent.exists
                ensureCreateParent = true
                
                @parent.createSync('777')
            
            try
                _fs.writeFileSync(@fullName, '', { encoding: 'utf8', mode: modeOctal, flag: writeflag }) # note that since the file contains zero bytes, the encoding doesn't actually matter at this point.
            catch ex
                success = false
            finally
                if success
                    @refresh()
                    
                    if ensureCreateParent
                        _fs.chmodSync(@parent.fullName, toIntegerFromOctalRepresenation(mode || DEFAULT_FILESYSTEM_CREATION_MODE))
                        
                        @parent.refresh()
                else
                    throw ex if ex
            return @
        
        'delete': (cb) =>
            cb = if arguments.length > 1 then arguments[arguments.length - 1] else cb

            parent = @parent

            parentFullName = parent.fullName
            
            parentFSPermissions = parent.fileSystemPermissions
            
            parentFSPermissionsOctalFileSystemModeString = parentFSPermissions.octalFileSystemModeString or DEFAULT_FILESYSTEM_CREATION_MODE
            
            thisFullName = @fullName
            
            _fs.chmod parentFullName, toIntegerFromOctalRepresenation('777'), ((error1) ->
                _fs.chmod thisFullName, toIntegerFromOctalRepresenation('777'), ((error2) ->
                    _fs.unlink thisFullName, ((error3) ->
                        _fs.chmod parentFullName, toIntegerFromOctalRepresenation(parentFSPermissionsOctalFileSystemModeString), ((error4) ->
                            return cb.call(@, error4) if isFunction(cb)
                        ).bind(@)
                    ).bind(@)
                ).bind(@)
            ).bind(@)
        
        deleteSync: () =>
            parent = @parent

            parentFullName = parent.fullName
            
            parentFSPermissions = parent.fileSystemPermissions
            
            parentFSPermissionsOctalFileSystemModeString = parentFSPermissions.octalFileSystemModeString or DEFAULT_FILESYSTEM_CREATION_MODE
            
            thisFullName = @fullName
            
            _fs.chmodSync(parentFullName, toIntegerFromOctalRepresenation('777'))
            
            _fs.chmodSync(thisFullName, toIntegerFromOctalRepresenation('777'))
            
            _fs.unlinkSync(thisFullName)
            
            _fs.chmodSync(parentFullName, toIntegerFromOctalRepresenation(parentFSPermissionsOctalFileSystemModeString))
            
            return

return _root[k] = v for k, v of thisNamespaceObjectContainer
