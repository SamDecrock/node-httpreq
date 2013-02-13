var httpreq = require('./httpreq');
fs = require('fs')

// get www.google.com
httpreq.get('http://www.google.com', function (err, res){
	if (err){
		console.log(err);
	}else{
		console.log(res.headers); //headers are stored in res.headers
		console.log(res.body); //content of the body is stored in res.body
	}
});

// do some post
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

// same as above + extra headers + cookies
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

// https also works:
httpreq.get('https://graph.facebook.com/19292868552', function (err, res){
	if (err){
		console.log(err);
	}else{
		console.log(JSON.parse(res.body));
	}
});

// uploading some file:
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

// u can use doRequest instead of .get or .post
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

// download a binary file:
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

// send your own body content (eg. xml):
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


