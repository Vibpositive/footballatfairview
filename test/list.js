var request = require('superagent');
var expect = require('expect.js');

describe('List list post', function()
{
	it('should return a list', function(done)
	{
		request
		.post('http://localhost:8080/list')
		.end(function(err, res){
			console.log(res.body);
			expect(res).to.exist;
			expect(res.status).to.equal(200);
			expect(res.body).to.be.an('array');
			expect(res.body).to.not.be.empty();
			done();
		});
	});
});