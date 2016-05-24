var request = require('superagent');
var expect = require('expect.js');

describe('List post', function()
{
	it('should return an empty list', function(done)
	{
		request
		.post('http://localhost:8080/list')
		.end(function(err, res){
			console.log(res);
			expect(res).to.exist;
			expect(res.status).to.equal(200);
			expect(res.text).to.contain('ok');
			done();
		});
	});
});