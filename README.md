node-httpreq
============

node-httpreq is a node.js library to do HTTP(S) requests the easy way

Do GET, POST, upload files, use cookies, change headers, ...

## Install

You can install __httpreq__ using the Node Package Manager (npm):

    npm install httpreq

## How to use

* [httpreq.get(url, [options], callback)](#get)
* [httpreq.post(url, [options], callback)](#post)
* [httpreq.uploadFile(options, callback)](#upload)
* [httpreq.doRequest(options, callback)](#dorequest)
* [Downloading a binary file](#binary)
* [Sending a custom body](#custombody)

---------------------------------------
<a name="get" />
### httpreq.get(url, [options], callback)

__Arguments__
 - url: The url to connect to. Can be http or https.
 - options: (optional) The following options can be passed:
    - parameters: an object of query parameters
    - headers: an object of headers
    - cookies: an array of cookies
    - binary: true/false (default: false), if true, res.body will a buffer containing the binary data
    - body: custom body content you want to send
 - callback(err, res): A callback function which is called when the request is complete. __res__ contains the headers ( __res.headers__ ) and the body ( __res.body__ )

__Example without options__

```js
var httpreq = require('httpreq');

httpreq.get('http://www.google.com', function (err, res){
	if (err){
		console.log(err);
	}else{
		console.log(res.headers);
		console.log(res.body);
	}
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
 - options: (optional) The following options can be passed:
    - parameters: an object of post parameters ( *application/x-www-form-urlencoded* is used)
    - headers: an object of headers
    - cookies: an array of cookies
    - binary: true/false (default: false), if true, res.body will a buffer containing the binary data
    - body: custom body content you want to send. Parameters are ignored when this is used.
 - callback(err, res): A callback function which is called when the request is complete. __res__ contains the headers ( __res.headers__ ) and the body ( __res.body__ )

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
### httpreq.uploadFile(options, callback)

__Arguments__
 - options: The following options can be passed:
    - url: the url to post the files to
    - parameters: an object of post parameters ( *multipart/form-data* is used)
    - files: an object of files (can be more than one)
    - headers: an object of headers
    - cookies: an array of cookies
    - binary: true/false (default: false), if true, res.body will a buffer containing the binary data
 - callback(err, res): A callback function which is called when the request is complete. __res__ contains the headers ( __res.headers__ ) and the body ( __res.body__ )

```js
var httpreq = require('httpreq');

httpreq.uploadFile({
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
<a name="dorequest" />
### httpreq.doRequest(options, callback)

This is used by httpreq.get() and httpreq.post()

__Arguments__
 - options: The following options can be passed:
    - url: the url to post the files to
    - method: 'GET' or 'POST'
    - parameters: an object of query/post parameters
    - files: an object of files (can be more than one)
    - headers: an object of headers
    - cookies: an array of cookies
    - binary: true/false (default: false), if true, res.body will a buffer containing the binary data
    - body: custom body content you want to send
 - callback(err, res): A callback function which is called when the request is complete. __res__ contains the headers ( __res.headers__ ) and the body ( __res.body__ )

__Example__

```js
var httpreq = require('httpreq');

httpreq.doRequest({
	url: 'https://graph.facebook.com/19292868552',
	method: 'GET',
	parameters: {
		name: 'test'
	}
},
function (err, res){
	if (err){
		console.log(err);
	}else{
		console.log(JSON.parse(res.body));
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


