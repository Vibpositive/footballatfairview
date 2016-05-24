var request = require('superagent');
var expect = require('expect.js');

describe('Routes main point', function()
{
	it('should get 200 message', function(done)
	{
		request
		.get('http://http://localhost:8080')
		.end(function(err, res){
			expect(res).to.exist;
			expect(res.status).to.equal(200);
			//expect(res.body).to.contain('world');
			done();
		});
	});
});

describe('Routes Login', function()
{
	it('should get 200 message', function(done)
	{
		request
		.get('http://http://localhost:8080/login')
		.end(function(err, res){
			expect(res).to.exist;
			expect(res.status).to.equal(200);
			//expect(res.body).to.contain('world');
			done();
		});
	});
});

describe('Routes indexuser', function()
{
	it('should get 200 message', function(done)
	{
		request
		.get('http://http://localhost:8080/indexuser')
		.end(function(err, res){
			expect(res).to.exist;
			expect(res.status).to.equal(200);
			//expect(res.body).to.contain('world');
			done();
		});
	});
});


