var expect = require('Chai').expect;

// ./test/tests.js

var server = require('../lib/server.js');

describe('server response', function () {
  before(function () {
    server.listen(8000);
  });

  after(function () {
    server.close();
  });
});