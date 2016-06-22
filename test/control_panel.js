var request          = require('superagent');
var expect           = require('expect.js');

var port             = 8080;
var baseUrl          = 'http://localhost:' + port
var list_id          = '575f2401c3fe8d106f774237'
var user_id          = '575f23d0c3fe8d106f774236'
var list_date_update = '1479998200000';
var list_date        = '1488998200000';
var list_size        = 21;
var list_status      = 'pending';

describe('Control Panel', function()
{
	describe('When requested at /matches/update', function ()
	{
		it('should return a 200 status code', function(done)
		{
			request
			.post(baseUrl + '/matches/update')
			.send(
			{
				list_id     : list_id,
				list_size   : list_size,
				list_status : list_status,
				list_date   : list_date_update
			})
			.end(function(err, res){
				expect(res).to.exist;
				expect(res.status).to.equal(200);
				expect(res.text).to.contain('ok');
				done();
			});
		});
		
	});

	describe('Testing GETs', function ()
	{
		it('should return a 200 status code for a get on users', function(done)
		{
			request
			.post(baseUrl + '/users')
			.send(
			{})
			.end(function(err, res){
				expect(res).to.exist;
				expect(res.status).to.equal(200);
				done();
			});
		});
	})
	describe('Testing main routes', function ()
	{
		it('should return a 200 status code for a get on matches/create', function(done)
		{
			request
			.get(baseUrl + '/matches/create')
			.send(
			{})
			.end(function(err, res){
				expect(res).to.exist;
				expect(res.status).to.equal(200);
				expect(res.text).to.contain('ok');
				done();
			});
		});

		it('should return a 200 status code for a post on matches/create', function(done)
		{
			request
			.post(baseUrl + '/matches/create')
			.send(
			{
				list_date : list_date,
				list_size : list_size,
				list_status : list_status
			})
			.end(function(err, res){
				expect(res).to.exist;
				expect(res.status).to.equal(200);
				expect(res.text).to.contain('exist');
				done();
			});
		});
		
	});
})