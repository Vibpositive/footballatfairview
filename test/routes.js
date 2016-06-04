var request = require('superagent');
var expect = require('expect.js');

describe('Routes main point', function()
{
	it('should get 200 message', function(done)
	{
		request
		.get('http://localhost:8080')
		.end(function(err, res){
			expect(res).to.exist;
			expect(res.status).to.equal(200);
			//expect(res.body).to.contain('world');
			done();
		});
	});
});

describe('List detail', function()
{
	it('should get 200 message', function(done)
	{
		request
		.get('http://localhost:8080/list/detail')
		.end(function(err, res){
			expect(res).to.exist;
			expect(res.status).to.equal(200);
			done();
		});
	});
});
/*
describe('Create List', function()
{
	it('should get 200 message', function(done)
	{
		request
		.get('http://localhost:8080/crud/list/create')
		.end(function(err, res){
			expect(res).to.exist;
			expect(res.status).to.equal(200);
			done();
		});
	});
});
*/
describe('Create List post', function()
{
	it('should get 200 message', function(done)
	{
		request
		.post('http://localhost:8080/crud/list/create')
		.send(
			{
				names       : [{nome:'Manny', datetime:Date.now()},{nome:'Manny', datetime:Date.now()}],
				list_status : 'active',
				list_size : '21',
				list_date : Date.now()
		})
		.end(function(err, res)
		{
			expect(res).to.exist;
			expect(res.status).to.equal(200);
			expect(res.text).to.match(/\b\w{24}\b/);
			done();
		});
	});
});

