node-httpreq
============

node-httpreq is a node.js library to do HTTP(S) requests the easy way

Do GET, POST, upload files, use cookies, change headers, ...

## Install

You can install __httpreq__ using the Node Package Manager (npm):

    npm install httpreq

## Simple example
```js
var httpreq = require('httpreq');

httpreq.get('http://www.google.com', function (err, res){
    if (err) return console.log(err);

    console.log(res.statusCode);
    console.log(res.headers);
    console.log(res.body);
});
```

## How to use

* [httpreq.get(url, [options], callback)](#get)
* [httpreq.post(url, [options], callback)](#post)
* [httpreq.uploadFiles(options, callback)](#upload)
* [Downloading a binary file](#binary)
* [Downloading a file directly to disk](#download)
* [Sending a custom body](#custombody)
* [Using a http(s) proxy](#proxy)
* [httpreq.doRequest(options, callback)](#dorequest)

---------------------------------------
<a name="get" />
### httpreq.get(url, [options], callback)

__Arguments__
 - url: The url to connect to. Can be http or https.
 - options: (all are optional) The following options can be passed:
    - parameters: an object of query parameters
    - headers: an object of headers
    - cookies: an array of cookies
    - binary: true/false (default: false), if true, res.body will a buffer containing the binary data
    - json: if you want to send json directly (content-type is set to *application/json* )
    - body: custom body content you want to send. Json is ignored when this is used.
    - allowRedirects: (default: __true__ , only with httpreq.get() ), if true, redirects will be followed
    - maxRedirects: (default: __10__ ). For example 1 redirect will allow for one normal request and 1 extra redirected request.
    - timeout: (default: __none__ ). Adds a timeout to the http(s) request. Should be in milliseconds.
    - proxy, if you want to pass your request through a http(s) proxy server:
        - host: eg: "192.168.0.1"
        - port: eg: 8888
        - protocol: (default: __'http'__ ) can be 'http' or 'https'
 - callback(err, res): A callback function which is called when the request is complete. __res__ contains the headers ( __res.headers__ ), the http status code ( __res.statusCode__ ) and the body ( __res.body__ )

__Example without options__

```js
var httpreq = require('httpreq');

httpreq.get('http://www.google.com', function (err, res){
	if (err) return console.log(err);

    console.log(res.statusCode);
    console.log(res.headers);
	console.log(res.body);
});
```

__Example with options__

```js
var httpreq = require('httpreq');

httpreq.get('http://posttestserver.com/post.php', {
	parameters: {
		name: 'John',
		lastname: 'Doe'
	},
	headers:{
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:18.0) Gecko/20100101 Firefox/18.0'
	},
	cookies: [
		'token=DGcGUmplWQSjfqEvmu%2BZA%2Fc',
		'id=2'
	]
}, function (err, res){
	if (err){
		console.log(err);
	}else{
		console.log(res.body);
	}
});
```
---------------------------------------
<a name="post" />
### httpreq.post(url, [options], callback)

__Arguments__
 - url: The url to connect to. Can be http or https.
 - options: (all are optional) The following options can be passed:
    - parameters: an object of post parameters ( *application/x-www-form-urlencoded* is used)
    - headers: an object of headers
    - cookies: an array of cookies
    - binary: true/false (default: __false__ ), if true, res.body will be a buffer containing the binary data
    - json: if you want to send json directly (content-type is set to *application/json* )
    - body: custom body content you want to send. Parameters or json is ignored when this is used.
    - allowRedirects: (default: __false__ ), if true, redirects will be followed
    - maxRedirects: (default: __10__ ). For example 1 redirect will allow for one normal request and 1 extra redirected request.
    - timeout: (default: none). Adds a timeout to the http(s) request. Should be in milliseconds.
    - proxy, if you want to pass your request through a http(s) proxy server:
        - host: eg: "192.168.0.1"
        - port: eg: 8888
        - protocol: (default: __'http'__ ) can be 'http' or 'https'
 - callback(err, res): A callback function which is called when the request is complete. __res__ contains the headers ( __res.headers__ ), the http status code ( __res.statusCode__ ) and the body ( __res.body__ )

__Example without extra options__

```js
var httpreq = require('httpreq');

httpreq.post('http://posttestserver.com/post.php', {
	parameters: {
		name: 'John',
		lastname: 'Doe'
	}
}, function (err, res){
	if (err){
		console.log(err);
	}else{
		console.log(res.body);
	}
});
```

__Example with options__

```js
var httpreq = require('httpreq');

httpreq.post('http://posttestserver.com/post.php', {
	parameters: {
		name: 'John',
		lastname: 'Doe'
	},
	headers:{
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:18.0) Gecko/20100101 Firefox/18.0'
	},
	cookies: [
		'token=DGcGUmplWQSjfqEvmu%2BZA%2Fc',
		'id=2'
	]
}, function (err, res){
	if (err){
		console.log(err);
	}else{
		console.log(res.body);
	}
});
```
---------------------------------------
<a name="upload" />
### httpreq.uploadFiles(options, callback)

__Arguments__
 - options: The following options can be passed:
    - url: the url to post the files to
    - parameters: an object of post parameters ( *multipart/form-data* is used)
    - files: an object of files (can be more than one)
    - headers: an object of headers
    - cookies: an array of cookies
    - binary: true/false (default: __false__ ), if true, res.body will be a buffer containing the binary data
 - callback(err, res): A callback function which is called when the request is complete. __res__ contains the headers ( __res.headers__ ), the http status code ( __res.statusCode__ ) and the body ( __res.body__ )

```js
var httpreq = require('httpreq');

httpreq.uploadFiles({
	url: "http://rekognition.com/demo/do_upload/",
	parameters:{
		name_space	: 'something',
	},
	files:{
		fileToUpload: __dirname + "/exampleupload.jpg"
	}},
function (err, res){
	if (err){
		console.log(err);
	}else{
		console.log(res.body);
	}
});
```

---------------------------------------
<a name="binary" />
### Downloading a binary file
To download a binary file, just add __binary: true__ to the options when doing a get or a post.

__Example__

```js
var httpreq = require('httpreq');

httpreq.get('https://ssl.gstatic.com/gb/images/k1_a31af7ac.png', {binary: true}, function (err, res){
    if (err){
        console.log(err);
    }else{
        fs.writeFile(__dirname + '/test.png', res.body, function (err) {
            if(err)
                console.log("error writing file");
        });
    }
});
```

---------------------------------------
<a name="download" />
### Downloading a file directly to disk
To download a file directly to disk, use the download methode provided.

__Example__

```js
var httpreq = require('httpreq');

httpreq.download(
    'https://ssl.gstatic.com/gb/images/k1_a31af7ac.png',
    __dirname + '/test.png'
, function (err, progress){
    if (err) return console.log(err);
    console.log(progress);
}, function (err, res){
    if (err) return console.log(err);
    console.log(res);
});

```
---------------------------------------
<a name="custombody" />
### Sending a custom body
Use the body option to send a custom body (eg. an xml post)

__Example__

```js
var httpreq = require('httpreq');

httpreq.post('http://posttestserver.com/post.php',{
    body: '<?xml version="1.0" encoding="UTF-8"?>',
    headers:{
        'Content-Type': 'text/xml',
    }},
    function (err, res) {
        if (err){
            console.log(err);
        }else{
            console.log(res.body);
        }
    }
);
```

---------------------------------------
<a name="proxy" />
### Using a http(s) proxy

__Example__

```js
var httpreq = require('httpreq');

httpreq.post('http://posttestserver.com/post.php', {
    proxy: {
        host: '10.100.0.126',
        port: 8888
    }
}, function (err, res){
    if (err){
        console.log(err);
    }else{
        console.log(res.body);
    }
});
```

---------------------------------------
<a name="dorequest" />
### httpreq.doRequest(options, callback)

httpreq.doRequest is internally used by httpreq.get() and httpreq.post(). You can use this directly. Everything is stays the same as httpreq.get() or httpreq.post() except that the following options MUST be passed:
- url: the url to post the files to
- method: 'GET' or 'POST'


