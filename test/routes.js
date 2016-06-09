var request = require('superagent');
var expect = require('expect.js');
var moment = require('moment');
var generateName = require('sillyname');

var sillyName = generateName();
var sillyName2 = generateName();

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
	this.timeout(15000);
	it('should get 200 message', function(done)
	{
		request
		.post('http://localhost:8080/crud/list/create')
		.send(
			{
				names       : [
				{
					first_name : sillyName.split(' ')[0],
					last_name  : sillyName.split(' ')[1],
					datetime   : Date.now(),
					player_id  : '01',
					status     : 'playing'
				},{
					first_name : sillyName2.split(' ')[0],
					last_name  : sillyName2.split(' ')[1],
					datetime   : Date.now(),
					player_id  : '01',
					status     : 'playing'
				}],
				list_status : 'active',
				list_size   : '21',
				list_date   : moment.now()
		})
		.end(function(err, res)
		{
			expect(res).to.exist;
			expect(res.status).to.equal(200)
			expect(res.text).to.match(/\b\w{24}\b/);
			done();
		});
	});
});



/*describe('Check route for participating in a match', function()
{
	it('should get 200 message', function(done)
	{
		request
		.post('http://localhost:8080/crud/list/participate')
		.end(function(err, res)
		{
			expect(res).to.exist;
			expect(res.status).to.equal(200)
			done();
		});
	});

});*/

/*describe('Add participant to a Match', function()
{
	it('should get a ok message', function(done)
	{
		request
		.post('http://localhost:8080/crud/list/participate')
		.send(
		{
			first_name : sillyName.split(' ')[0],
			last_name  : sillyName.split(' ')[1],
			datetime   : moment.now(),
			player_id  : '01',
			status     : 'playing'
		})
		.end(function(err, res)
		{
			expect(res).to.exist;
			expect(res.status).to.equal(200)
			expect(res.body).to.have.key('message');
			done();
		});
	});
});*/

describe('Get list details by post', function()
{
	it('should get a 200 status message', function(done)
	{
		request
		.post('http://localhost:8080/list/57587de6d1c385f511fbbb17')
		.send(
		{
			first_name : sillyName.split(' ')[0],
			last_name  : sillyName.split(' ')[1],
			datetime   : moment.now(),
			player_id  : '01',
			status     : 'playing'
		})
		.end(function(err, res)
		{
			expect(res).to.exist;
			expect(res.status).to.equal(200)
			done();
		});
	});
});
/*describe('Control Panel', function()
{
	it('should get 200 message for main url', function(done)
	{
		request
		.get('http://localhost:8080/cp')
		.end(function(err, res)
		{
			expect(res).to.exist;
			expect(res.status).to.equal(200);
			done();
		});
	});
});*/
