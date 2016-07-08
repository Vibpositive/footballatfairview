var request          = require('superagent');
// var expect           = require('expect.js');
var expect           = require('chai').expect;

var port             = 8080;
var baseUrl          = 'http://localhost:' + port

var list_id          = '575f2401c3fe8d106f774237'
var list_date_update = '1479998200000';
var list_date        = '1488998200000';
var list_size        = 21;
var list_status      = 'pending';

var user_id          = "576c64860246493a57afb09c"
var user_name        = "AAAAAAAAAA";
var user_phone       = "1111111111";
var user_email       = "1111111@111.111";


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

		it('should return an array on users', function(done)
		{
			request
			.post(baseUrl + '/users')
			.send(
			{})
			.end(function(err, res){
				expect(res).to.exist;
				expect(res.status).to.equal(200);
				expect(res.body).to.be.an('array');
				done();
			});
		});

		it('should return 200 on get on user view', function(done)
		{
			request
			.get(baseUrl + '/user/view/' + user_id)
			.send(
			{})
			.end(function(err, res){
				expect(res).to.exist;
				expect(res.status).to.equal(200);
				// expect(res.body).to.be.an('array');
				done();
			});
		});

		it('should return 200 on get on edit user', function(done)
		{
			request
			.get(baseUrl + '/user/edit/' + user_id)
			.send(
			{})
			.end(function(err, res){
				expect(res).to.exist;
				expect(res.status).to.equal(200);
				// expect(res.body).to.be.an('array');
				done();
			});
		});

		it('should return 200 on post on edit user', function(done)
		{
			request
			.post(baseUrl + '/user/edit/' + user_id)
			.send(
			{
				name : user_name,
				phone : user_phone,
				email : user_email
			})
			.end(function(err, res){
				expect(res).to.exist;
				expect(res.status).to.equal(200);
				expect(res.text).to.contain("ok");
				done();
			});
		});

		/*it('should return a 200 status code for a post on matches/create', function(done)
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
		});*/
		
	});
})