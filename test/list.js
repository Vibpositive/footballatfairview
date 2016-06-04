var request = require('superagent');
var expect = require('expect.js');

describe('Create a list', function()
{
	it('should return a regExp of 24', function(done)
	{
		request
		.get('http://localhost:8080/crud/list/create')
		.end(function(err, res){
			expect(res).to.exist;
			expect(res.status).to.equal(200);
			expect(res.text).to.match(/\b\w{24}\b/);
			done();
		});
	});
});