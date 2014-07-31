# fs-filesysteminfo [![Build Status](https://secure.travis-ci.org/cookch10/node-fs-filesysteminfo.png?branch=master)](http://travis-ci.org/cookch10/node-fs-filesysteminfo)

> The fs-filesysteminfo module, fsi, wraps the native NodeJS File System and Path API into a File System Object (FSO) model, which facilitates an object-based approach for working with directories and files.  Inspired by the .NET file system libraries.


## Getting Started

Install the module with: `npm install fs-filesysteminfo --save`


## Overview

The fs-filesysteminfo NodeJS module, fsi , exposes three classes (objects) for working with the filesystem: `FileSystemInfo`, `DirectoryInfo`, and `FileInfo`.
`DirectoryInfo` and `FileInfo` are subclasses of the `FileSystemInfo` class, both expose instance methods for working with directories and files, respectively.

All fsi objects are instantiated with a `path` {String}.  An exception is thrown if the `path` length is zero or if `path` is `null` or `undefined`.
A `path` used to construct the object can be relative or absolute, and the path does not need to exist.  If a relative `path` is used, it will be resolved
relative to the current `process.cwd()`.

<b>Note</b>:  All fsi object properties and methods currently utilize *synchronous* Node methods.


## Usage
```javascript
var fsi = require('fs-filesysteminfo');
```


## Class: FileSystemInfo

The base class for the `FileInfo` and `DirectoryInfo` objects.  Create a `FileSystemInfo` object by instantiating the fsi `FileSystemInfo` class.


### Constructor: FileSystemInfo(`path`)

`path` {String} A string specifying the path on which to create the `FileSystemInfo` object.  

```javascript
var fsiObj = new fsi.FileSystemInfo('temp');  //If temp is an existing file or directory then fsiObj.exists === true otherwise false
```


### Properties: FileSystemInfo

| Name         | Type      | Description                                                                                                                                                                                                                                                            |
|--------------|-----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| originalPath | {String}  | The value that was used to construct the object.                                                                                                                                                                                                                       |
| fullName     | {String}  | Gets the full path of the directory or file.                                                                                                                                                                                                                           |
| name         | {String}  | Gets the last portion of a path. Similar to the Unix basename command.                                                                                                                                                                                                 |
| extension    | {String}  | Gets the extension of the path, from the last &#x0027;.&#x0027; to end of string in the last portion of the path. If there is no &#x0027;.&#x0027; in the last portion of the path or the first character of it is &#x0027;.&#x0027;, then it returns an empty string. |
| status       | {Object}  | An object composed of properties specific to the `FileSystemInfo` instance. This information is obtained by using Node&#x0027;s `fs.statSync` method.                                                                                                                  |
| flags        | {Object}  | An object containing the following {Boolean} properties:  `isDirectory`, `isFile`, `isBlockDevice`, `isCharacterDevice`, `isFIFO`, `isSocket`, and `isSymbolicLink`.                                                                                                   |
| exists       | {Boolean} | Gets a value indicating whether the directory or file exists.                                                                                                                                                                                                          |


### Methods: FileSystemInfo

| Name    | Type     | Description                                    |
|---------|----------|------------------------------------------------|
| GetType | {String} | Returns the type name of the current instance. |
| Refresh | void     | Refreshes the state of the current instance.   |


### Remarks: FileSystemInfo

To determine if the `FileSystemInfo` instance is a file or a directory, use the following:
```javascript
if (fsiObj.exists) {
    var fflags = fsiObj.flags
    var isDirecory = fflags.isDirectory;
    var isFile = fflags.isFile;
}
```


## Class: DirectoryInfo

Create a DirectoryInfo object by instantiating the fsi `DirectoryInfo` class.


### Constructor: DirectoryInfo(`path`)

`path` {String} A string specifying the path on which to create the DirectoryInfo object.  

```javascript
var fsiObj = new fsi.DirectoryInfo('temp');  //If temp is an existing directory then fsiObj.exists === true otherwise false
```


### Properties: DirectoryInfo

| Name   | Type            | Description                                        |
|--------|-----------------|----------------------------------------------------|
| parent | {DirectoryInfo} | Gets the parent directory of the current instance. |


### Methods: DirectoryInfo

| Name                                                                 | Type                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|----------------------------------------------------------------------|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| CreateSync([mode])                                                   | void                          | Creates the directory if it does not already exist.  `mode` defaults to `0777`.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| CreateSubdirectorySync(path, [mode])                                 | {DirectoryInfo}               | Creates a subdirectory or subdirectories on the specified `path` if it does not exist.  The specified `path` is relative to the current instance.  `mode` defaults to `0777`.<br /><br />An exception is thrown if the `path` length is zero or if `path` is `null` or `undefined`.<br /><br />Returns a new `DirectoryInfo` instance of the deepest subdirectory.  If multiple paths are specified (via path separator), and they do not exist, they will be created.  Example: /tmp/test1/test2            |
| DeleteSync([recursive])                                              | void                          | Permanently deletes the instance directory.  If `recursive` is true, the directory and all its contents are deleted.  If `recursive` is `false` and the directory is not empty, an exception is thrown.  `recursive` defaults to `false`.                                                                                                                                                                                                                                                                    |
| EnumerateFileSystemInfosSync([fnSearchFilter, searchSubdirectories]) | {Array&lt;FileSystemInfo&gt;} | Returns an {Array} of {DirectoryInfo} and/or {FileInfo} objects comprised of the current directory contents.<br /><br />`fnSearchFilter`:  {Function(`fsname`)} that determines whether the current item in the enumeration is included in the output {Array} if the function evaluates to `true` where `fsname` is the name of the current filesystem item.<br /><br />`searchSubdirectories`: {Boolean} that indicates whether subdirectories will be recursively searched.  The default value is `false`. |


### Remarks: DirectoryInfo

Create a subdirectory from a `DirectoryInfo` instance:
```javascript
var fsiObj = new fsi.DirectoryInfo('currentDir');
var subDir = fsiObj.CreateSubdirectorySync('subDir','777'); //Create a subdirectory with readable, writable, and executable permissions
```

Enumeration examples:
```javascript
var fsiObj = new fsi.DirectoryInfo('currentDir');
var directoryContentsArr1 = fsiObj.EnumerateFileSystemInfosSyncSync('', true); //Return all filesystem objects (recursively including all subdirectories and files)
var directoryContentsArr2 = fsiObj.EnumerateFileSystemInfosSync(function (fsname) { return /^\..*$/.test(fsname); }, true); //Return all filesystem objects (recursively including all subdirectories and files) whose name starts with a dot (.)
var pathnamesArr = directoryContentsArr2.map(function (e) { return e.fullName; }); //Generate an array of absolute paths
```


## Class: FileInfo

Create a FileInfo object by instantiating the fsi `FileInfo` class.


### Constructor: FileInfo(`path`)

`path` {String} A string specifying the path on which to create the FileInfo object.  

```javascript
var fsiObj = new fsi.FileInfo('temp');  //If temp is an existing file then fsiObj.exists === true otherwise false
```


### Properties: FileInfo

| Name   | Type            | Description                                        |
|--------|-----------------|----------------------------------------------------|
| parent | {DirectoryInfo} | Gets the parent directory of the current instance. |


### Methods: FileInfo

| Name                                                                 | Type                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|----------------------------------------------------------------------|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| DeleteSync()                                                         | void                          | Permanently deletes the instance file.                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |



### Remarks: FileInfo
This is a work in progress (WIP).


*** *** ***


## TODO
* Look at incorporating glob in filesystem enumeration for walking / event emitting, filtering.
* Look at incorporating filesystem watching / event emitting.
* Expose Node's path API via fsi.path.
* Finish stubbing out the FileInfo class.
* Continue adding functionality.
* Look at adding async methods / patterns.
* Add a DirectoryInfo.CleanSync() method to remove directory content without removing the directory itself.

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com).


## License

Copyright (c) 2014 Christopher M. Cook  
Licensed under the MIT license.
