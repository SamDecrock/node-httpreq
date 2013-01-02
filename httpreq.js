/*
Copyright (c) 2011 Sam Decrock <sam.decrock@gmail.com>

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


exports.doRequest = function(o, callback){
	var responsebody = "";
	var params;

	var reqUrl = url.parse(o.url);
	var path = reqUrl.path;

	var port = 80;
	if(reqUrl.protocol == 'https:')
		port = 443;

	if(o.method == 'POST' && o.options){
		params = querystring.stringify(o.options);
	}else if(o.method == 'GET' && o.options){
		path += "?" + querystring.stringify(o.options);
	}

	var requestoptions = {
		host: reqUrl.hostname,
		port: port,
		path: path,
		method: o.method,
		headers: {}
	};

	if(params){
		requestoptions['headers']['Content-Type'] = 'aplication/x-www-form-urlencoded';
		requestoptions['headers']['Content-Length'] = params.length;
	}

	if(o.cookies){
		requestoptions['headers']['Cookie'] = o.cookies.join("; ");
	}

	if(o.headers){
		for(var headerkey in o.headers){
			requestoptions['headers'][headerkey] = o.headers[headerkey];
		}
	}

	function requestResponse(res){
		res.setEncoding('utf8');

		res.on('data', function (chunk) {
			responsebody += chunk;
		});

		res.on('end', function (err) {
			callback(null, {headers: res.headers, body: responsebody});
		});

		res.on('close', function (err) {
			callback(err);
		});
	}

	var request;

	if(reqUrl.protocol == 'https:')
		request = https.request(requestoptions, requestResponse);
	else
		request = http.request(requestoptions, requestResponse);

	if(params)
		request.write(params);

	request.end();
};



exports.uploadFile = function(o, callback){
	var responsebody = "";

	var reqUrl = url.parse(o.url);

	var port = 80;
	if(reqUrl.protocol == 'https:')
		port = 443;


	var crlf = "\r\n";
	var boundary = '---------------------------10102754414578508781458777923';
	var separator = '--' + boundary;

	var bufferArray = new Array();

	for(var key in o.options){
		var optionsData = separator + crlf
			+ 'Content-Disposition: form-data; name="'+encodeURIComponent(key)+'"' + crlf
			+ crlf
			+ encodeURIComponent(o.options[key]) + crlf;

		bufferArray.push(new Buffer(optionsData));
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
		res.setEncoding('utf8');

		res.on('data', function (chunk) {
			responsebody += chunk;
		});

		res.on('end', function (err) {
			callback(null, {headers: res.headers, body: responsebody});
		});

		res.on('close', function (err) {
			callback(err);
		});
	}

	var request;

	if(reqUrl.protocol == 'https:')
		request = https.request(requestoptions, requestResponse);
	else
		request = http.request(requestoptions, requestResponse);

	request.write(multipartBody);

	request.end();
}


