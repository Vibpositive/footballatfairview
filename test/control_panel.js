var request = require('superagent');
var expect  = require('expect.js');

var port    = 8080;
var baseUrl = 'http://localhost:' + port
var list_id = '575f2401c3fe8d106f774237'
var user_id = '575f23d0c3fe8d106f774236'
var list_date = '1467808200000';
var list_size = 21;
var list_status = 'list_status';

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
				list_id : list_id,
				list_size : list_size,
				list_status : list_status,
				list_date   : list_date
			})
			.end(function(err, res){
				expect(res).to.exist;
				expect(res.status).to.equal(200);
				expect(res.text).to.contain('ok');
				done();
			});
		});
		
	});
})