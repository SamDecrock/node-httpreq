node-httpreq
============

Node.JS library to do http(s) requests (GET, POST, upload files, use cookies, ...) the easy way.

## Example

```js
var httpreq = require('httpreq');

httpreq.get('http://www.google.com', function(err, res){
	if (err){
		console.log(err);
	}else{
		console.log(res.headers);
		console.log(res.body);
	}
});
```
