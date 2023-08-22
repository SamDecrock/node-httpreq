const httpreq = require('../lib/httpreq');
const assert = require("assert");
const expect = require("chai").expect;
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })


describe("httpreq", function(){

  var port, app, webserver, endpointroot;

  before(function (done) {
    port = Math.floor( Math.random() * (65535 - 1025) + 1025 );

    endpointroot = 'http://localhost:' + port;

    app = express();

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: true }));

    // parse application/json
    app.use(bodyParser.json());

    // serve static files
    app.use('/static', express.static(__dirname))

    webserver = app.listen(port, function(){
      console.log("web server listening on port " + port);
      done();
    });

  });

  after(function () {
    webserver.close();
  });


  describe("get", () => {
    it("should do a simple GET request", async () => {

      var path = '/get'; // make sure this is unique when writing tests
      var jsonData = {some: 'data'};

      app.get(path, function (req, res) {
        res.json(jsonData);
      });

      var res = await httpreq.get(endpointroot + path);
      expect(JSON.parse(res.body)).to.deep.equal(jsonData);
    });

    it("should do a HTTPS GET request and shuffle the ciphers", async () => {
      var res = await httpreq.get('https://www.reichelt.com/be/nl/raspberry-pi-afstandsboutset-30mm-rpi-mountingkit3-p162090.html', {shuffleCiphers: true});
      expect(res.statusCode).to.deep.equal(200);
    });
  });

  describe("head", () => {

    it("should do a simple HEAD request", async () => {

      var path = '/head';
      var headerValue = 'abcd';

      app.head(path, function (req, res) {
        res.set('x-user', headerValue);
        res.sendStatus(200);
      });

      var res = await httpreq.head(endpointroot + path);
      expect(res.headers['x-user']).to.deep.equal(headerValue);
    });

  });

  describe("post", () => {

    it("should do a simple POST request with parameters", (done) => {

      var parameters = {
        name: 'John',
        lastname: 'Doe'
      };

      var path = '/post';

      // set up webserver endpoint:
      app.post(path, function (req, res) {
        res.send('ok');

        expect(req.body).to.deep.equal(parameters);

        done();
      });

      // post parameters to webserver endpoint:
      httpreq.post(endpointroot + path, {
        parameters: parameters
      });

    });

    it("should do a simple POST request with parameters without callback function", (done) => {

      var parameters = {
        name: 'John',
        lastname: 'Doe'
      };

      var path = '/postnocallback';

      // set up webserver endpoint:
      app.post(path, function (req, res) {
        res.send('ok');

        expect(req.body).to.deep.equal(parameters);

        done();
      });

      // post parameters to webserver endpoint:
      httpreq.post(endpointroot + path, {
        parameters: parameters
      });

    });


    it("should do a simple POST request and check the response", async () => {

      var jsonData = {some: 'data'};

      var path = '/postwithresponse';

      // set up webserver endpoint:
      app.post(path, function (req, res) {
        res.json(jsonData);
      });

      // post parameters to webserver endpoint:
      var res = await httpreq.post(endpointroot + path);
      expect(JSON.parse(res.body)).to.deep.equal(jsonData);

    });

    it("should do a simple POST request with parameters and cookies", (done) => {

      var parameters = {
        name: 'John',
        lastname: 'Doe'
      };

      var cookies = [
        'token=DGcGUmplWQSjfqEvmu%2BZA%2Fc',
        'id=2'
      ];

      var path = '/postcookies';

      // set up webserver endpoint:
      app.post(path, function (req, res) {
        res.send('ok');

        expect(req.body).to.deep.equal(parameters);
        expect(req.headers.cookie).to.equal(cookies.join('; '));

        done();
      });

      // post testdata to webserver endpoint:
      httpreq.post(endpointroot + path, {
        parameters: parameters,
        cookies: cookies
      });

    });

    it("should do a simple POST request with parameters and custom headers", (done) => {

      var parameters = {
        name: 'John',
        lastname: 'Doe'
      };

      var headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:18.0) Gecko/20100101 Firefox/18.0'
      };

      var path = '/postheaders';

      // set up webserver endpoint:
      app.post(path, function (req, res) {
        res.send('ok');

        expect(req.body).to.deep.equal(parameters);
        expect(req.headers).to.have.a.property('user-agent', headers['User-Agent']);

        done();
      });

      // post testdata to webserver endpoint:
      httpreq.post(endpointroot + path, {
        parameters: parameters,
        headers: headers
      });

    });

  });


  describe("put", function(){
    it("should do a simple PUT request with parameters", (done) => {

      var parameters = {
        name: 'John',
        lastname: 'Doe'
      };

      var path = '/put';

      // set up webserver endpoint:
      app.put(path, function (req, res) {
        res.send('ok');

        expect(req.body).to.deep.equal(parameters);

        done();
      });

      // put parameters to webserver endpoint:
      httpreq.put(endpointroot + path, {
        parameters: parameters
      });

    });
  });

  describe("patch", () => {
    it("should do a simple PATCH request with parameters", (done) => {

      var parameters = {
        name: 'John',
        lastname: 'Doe'
      };

      var path = '/patch';

      // set up webserver endpoint:
      app.patch(path, function (req, res) {
        res.send('ok');

        expect(req.body).to.deep.equal(parameters);

        done();
      });

      // patch parameters to webserver endpoint:
      httpreq.patch(endpointroot + path, {
        parameters: parameters
      });

    });
  });

  describe("delete", () => {
    it("should do a simple DELETE request", (done) => {

      var path = '/delete';

      // set up webserver endpoint:
      app.delete(path, function (req, res) {
        res.send('ok');

        done();
      });

      // send delete request:
      httpreq.delete(endpointroot + path);
    });
  });


  describe("post json", () => {
    it('should POST some json', (done) => {
      var somejson = {
        name: 'John',
        lastname: 'Doe'
      };

      var path = '/postjson';

      // set up webserver endpoint:
      app.post(path, function (req, res) {
        res.send('ok');

        expect(req.body).to.deep.equal(somejson);

        done();
      });

      httpreq.post(endpointroot + path, {
        json: somejson
      });
    });
  });


  describe("upload file", () => {
    it('should upload 1 file (old way)', (done) => {

      var testparams = {
        name: 'John',
        lastname: 'Doe'
      };

      var testfile = __dirname + "/testupload.jpg";

      var path = '/uploadfile_old';

      // set up webserver endpoint:
      app.post(path, upload.single('myfile'), function (req, res) {
        res.send('ok');

        expect(req.body).to.deep.equal(testparams);

        comparefiles(req.file.path, testfile, done);
      });

      httpreq.uploadFiles({
        url: endpointroot + path,
        parameters: testparams,
        files:{
          myfile: testfile
        }
      });
    });

    it('should upload 2 files (using POST)', (done) => {

      var testparams = {
        name: 'John',
        lastname: 'Doe'
      };

      var testfile = __dirname + "/testupload.jpg";

      var path = '/uploadfiles';

      // set up webserver endpoint:
      app.post(path, upload.fields([{name: 'myfile'}, {name: 'myotherfile'}]), function (req, res) {
        res.send('ok');

        expect(req.body).to.deep.equal(testparams);

        comparefiles(req.files['myfile'][0].path, testfile, function () {
          comparefiles(req.files['myotherfile'][0].path, testfile, function () {
            done();
          });
        });
      });

      httpreq.post(endpointroot + path, {
        parameters: testparams,
        files:{
          myfile: testfile,
          myotherfile: testfile
        }
      });
    });

    it('should upload 2 files (as array, using POST)', (done) => {

      var testparams = {
        name: 'John',
        lastname: 'Doe'
      };

      var testfile = __dirname + "/testupload.jpg";

      var path = '/uploadfiles_array';

      // set up webserver endpoint:
      app.post(path, upload.fields([{name: 'myfiles'}, {name: 'myotherfile'}]), function (req, res) {
        res.send('ok');

        expect(req.body).to.deep.equal(testparams);

        comparefiles(req.files['myfiles'][0].path, testfile, function () {
          comparefiles(req.files['myfiles'][1].path, testfile, function () {
            done();
          });
        });
      });

      httpreq.post(endpointroot + path, {
        parameters: testparams,
        files:{
          myfiles: [testfile, testfile]
        }
      });
    });

    it('should upload 2 files (using PUT)', (done) => {

      var testparams = {
        name: 'John',
        lastname: 'Doe'
      };

      var testfile = __dirname + "/testupload.jpg";

      var path = '/uploadfiles_put';

      // set up webserver endpoint:
      app.put(path, upload.fields([{name: 'myfile'}, {name: 'myotherfile'}]), function (req, res) {
        res.send('ok');

        expect(req.body).to.deep.equal(testparams);

        comparefiles(req.files['myfile'][0].path, testfile, function () {
          comparefiles(req.files['myotherfile'][0].path, testfile, function () {
            done();
          });
        });
      });

      httpreq.put(endpointroot + path, {
        parameters: testparams,
        files:{
          myfile: testfile,
          myotherfile: testfile
        }
      });
    });
  });

  describe("download", () => {
    it('should download 1 file using get()', async () => {

      var testfile = __dirname + "/testupload.jpg";

      // no need to set up webserver response, webserver is serving this folder as static files

      var res = await httpreq.get(endpointroot + "/static/testupload.jpg", {binary: true});
      var testfileData = fs.readFileSync(testfile);
      expect(res.body).to.deep.equal(testfileData);
    });

    it('should download 1 file directly to disk', async () => {

      var testfile = __dirname + "/testupload.jpg";

      // no need to set up webserver response, webserver is serving this folder as static files

      var res = await httpreq.download(
        endpointroot + "/static/testupload.jpg",
        __dirname + "/" + Date.now() + ".jpg"
      );

      console.log('res:', res);

      var testfileData = fs.readFileSync(testfile);
      var downloadedFile = fs.readFileSync(res.downloadlocation);
      expect(downloadedFile).to.deep.equal(testfileData);
    });
  });

});


function comparefiles (file1, file2, callback) {
  fs.readFile(file1, function (err, file1data) {
    if(err) throw err;

    fs.readFile(file2, function (err, file2data) {
      if(err) throw err;

       expect(file1data).to.deep.equal(file2data);

       callback();
    });
  });
}