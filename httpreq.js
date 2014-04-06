/*
Copyright (c) 2013 Sam Decrock <sam.decrock@gmail.com>

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var querystring = require('querystring');
var https = require('https');
var http = require('http');
var url = require('url');
var fs = require('fs');

exports.get = function(url, options, callback){
	// if only 2 args are provided
	if(callback === undefined && options && typeof(options)==="function")
		callback = options;

	var moreOptions = options;
	moreOptions.url = url;
	moreOptions.method = 'GET';

	if(moreOptions.allowRedirects === undefined)
		moreOptions.allowRedirects = true;

	doRequest(moreOptions, callback);
}

exports.post = function(url, options, callback){
	// if only 2 args are provided
	if(callback === undefined && options && typeof(options)==="function")
		callback = options;

	var moreOptions = options;
	moreOptions.url = url;
	moreOptions.method = 'POST';
	doRequest(moreOptions, callback);
}

exports.put = function(url, options, callback){
	// if only 2 args are provided
	if(callback === undefined && options && typeof(options)==="function")
		callback = options;

	var moreOptions = options;
	moreOptions.url = url;
	moreOptions.method = 'PUT';
	doRequest(moreOptions, callback);
}

exports.delete = function(url, options, callback){
	// if only 2 args are provided
	if(callback === undefined && options && typeof(options)==="function")
		callback = options;

	var moreOptions = options;
	moreOptions.url = url;
	moreOptions.method = 'DELETE';
	doRequest(moreOptions, callback);
}

exports.download = function (url, downloadlocation, progressCallback, callback) {
	var options = {};
	options.url = url;
	options.method = 'GET';
	options.downloadlocation = downloadlocation;
	options.allowRedirects = true;

	// if only 3 args are provided, so no progressCallback
	if(callback === undefined && progressCallback && typeof(progressCallback)==="function")
		callback = progressCallback;
	else
		options.progressCallback = progressCallback;

	doRequest(options, callback);
}

function doRequest(o, callback){
	if(!callback){
		callback = function (err) {
			// dummy function
		}
	}

	if(o.maxRedirects === undefined){
		o.maxRedirects = 10;
	}

	var hasTimedout = false;
	var chunks = [];
	var body;

	var port;
	var host;
	var path;
	var isHttps = false;

	if(o.proxy){
		port = o.proxy.port;
		host = o.proxy.host;
		path = o.url; // complete url
		if(o.proxy.protocol && o.proxy.protocol.match(/https/)) isHttps = true;
	}else{
		var reqUrl = url.parse(o.url);
		host = reqUrl.hostname;
		path = reqUrl.path;
		if(reqUrl.protocol == 'https:') isHttps = true;
		if(reqUrl.port){
			port = reqUrl.port;
		}else if(isHttps){
			port = 443;
		}else{
			port = 80;
		}
	}

	if(o.method == 'POST' && o.parameters){
		body = querystring.stringify(o.parameters);
	}else if(o.method == 'GET' && o.parameters){
		path += "?" + querystring.stringify(o.parameters);
	}

	if(o.json){
		body = JSON.stringify(o.json);
	}

	if(o.body){
		body = o.body;
	}

	var requestoptions = {
		host: host,
		port: port,
		path: path,
		method: o.method,
		headers: {}
	};

	if(!o.redirectCount){
		o.redirectCount = 0;
	}

	if(o.method == 'POST' && o.parameters){
		requestoptions['headers']['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
	}

	if(o.json){
		requestoptions['headers']['Content-Type'] = 'application/json';
	}

	if(body){
		requestoptions['headers']['Content-Length'] = (new Buffer(body, 'utf8')).length;
	}

	if(o.cookies){
		requestoptions['headers']['Cookie'] = o.cookies.join("; ");
	}

	if(o.headers){
		for(var headerkey in o.headers){
			requestoptions['headers'][headerkey] = o.headers[headerkey];
		}
	}

	if(o.agent){
		requestoptions.agent = o.agent;
	}

	function requestResponse(res){
		var ended = false;
		var currentsize = 0;

		var downloadstream = null;
		if(o.downloadlocation)
			downloadstream = fs.createWriteStream(o.downloadlocation);

		res.on('data', function (chunk) {
			if(o.downloadlocation)
				downloadstream.write(chunk); //write it to disk, not to memory
			else
				chunks.push(chunk);

			if(o.progressCallback){
				var totalsize = res.headers['content-length'];
				if(totalsize){
					currentsize += chunk.length;

					o.progressCallback(null, {
						totalsize: totalsize,
						currentsize: currentsize,
						percentage: currentsize*100/totalsize
					});
				}else{
					o.progressCallback(new Error("no content-length specified for file, so no progress monitoring possible"));
				}

			}
		});

		res.on('end', function (err) {
			ended = true;

			// check for redirects
			if(res.headers.location && o.allowRedirects){
				if(o.redirectCount < o.maxRedirects){
					o.redirectCount++;
					o.url = res.headers.location;
					return doRequest(o, callback);
				} else {
					var err = new Error("Too many redirects (> " + o.maxRedirects + ")");
					err.code = 'TOOMANYREDIRECTS';
					err.redirects = o.maxRedirects;
					return callback(err);
				}
			}

			if(!o.downloadlocation){
				var responsebody = Buffer.concat(chunks);
				if(!o.binary)
					responsebody = responsebody.toString('utf8');

				callback(null, {headers: res.headers, statusCode: res.statusCode, body: responsebody, cookies: extractCookies(res.headers)});
			}else{
				downloadstream.end(null, null, function () {
					callback(null, {headers: res.headers, statusCode: res.statusCode, downloadlocation: o.downloadlocation, cookies: extractCookies(res.headers)});
				});
			}
		});

		res.on('close', function () {
			if(!ended)
				callback(new Error("Request aborted"));
		});
	}

	var request;

	if(isHttps)
		request = https.request(requestoptions, requestResponse);
	else
		request = http.request(requestoptions, requestResponse);

	if(o.timeout){
		request.setTimeout(o.timeout, function (k, d){
			hasTimedout = true;
			request.abort();
		});
	}

	request.on('error', function (err) {
		if(hasTimedout){
			var err = new Error("request timed out");
			err.code = 'TIMEOUT';
			callback(err);
		} else {
			callback(err);
		}
	});

	if(body)
		request.write(body, 'utf8');

	request.end();
};



exports.uploadFiles = function(o, callback){
	var chunks = [];

	var reqUrl = url.parse(o.url);

	var port;

	if(reqUrl.port){
		port = reqUrl.port;
	}else if(reqUrl.protocol == 'https:'){
		port = 443;
	}else{
		port = 80;
	}

	var crlf = "\r\n";
	var boundary = '---------------------------10102754414578508781458777923';
	var separator = '--' + boundary;

	var bufferArray = new Array();

	for(var key in o.parameters){
		var parametersData = separator + crlf
			+ 'Content-Disposition: form-data; name="'+encodeURIComponent(key)+'"' + crlf
			+ crlf
			+ encodeURIComponent(o.parameters[key]) + crlf;

		bufferArray.push(new Buffer(parametersData));
	}

	for(var file in o.files){
		var filepath = o.files[file];
		var filename = filepath.replace(/\\/g,'/').replace( /.*\//, '' );

		var fileData = separator + crlf
			+ 'Content-Disposition: file; name="' + file + '"; filename="' + filename + '"' + crlf
			+ 'Content-Type: application/octet-stream' +  crlf
			+ crlf;

		bufferArray.push(new Buffer(fileData));
		bufferArray.push(require("fs").readFileSync(filepath));
	}

	var footer = crlf + separator + '--' + crlf;
	bufferArray.push(new Buffer(footer));

	var multipartBody = Buffer.concat(bufferArray);

	var requestoptions = {
		host: reqUrl.hostname,
		port: port,
		path: reqUrl.path,
		method: 'POST',
		headers: {}
	};

	requestoptions['headers']['Content-Type'] = 'multipart/form-data; boundary=' + boundary;
	requestoptions['headers']['Content-Length'] = multipartBody.length;

	if(o.cookies){
		requestoptions['headers']['Cookie'] = o.cookies.join("; ");
	}

	if(o.headers){
		for(var headerkey in o.headers){
			requestoptions['headers'][headerkey] = o.headers[headerkey];
		}
	}

	function requestResponse(res){
		var ended = false;

		res.on('data', function (chunk) {
			chunks.push(chunk);
		});

		res.on('end', function (err) {
			ended = true;
			var responsebody = Buffer.concat(chunks);
			if(!o.binary)
				responsebody = responsebody.toString('utf8');

			callback(null, {headers: res.headers, statusCode: res.statusCode, body: responsebody});
		});

		res.on('close', function () {
			(!ended)
				callback(new Error("Request aborted"));
		});
	}

	var request;

	if(reqUrl.protocol == 'https:')
		request = https.request(requestoptions, requestResponse);
	else
		request = http.request(requestoptions, requestResponse);

	request.on('error', function (err) {
		callback(err);
	});

	request.write(multipartBody);

	request.end();
}

function extractCookies (headers) {
	var rawcookies = headers['set-cookie'];

	if(!rawcookies) return [];
	if(rawcookies == []) return [];

	var cookies = [];
	for (var i = 0; i < rawcookies.length; i++) {
		var rawcookie = rawcookies[i].split(';');
		if(rawcookie[0]) cookies.push(rawcookie[0]);
	};
	return cookies;
}

exports.doRequest = doRequest;
