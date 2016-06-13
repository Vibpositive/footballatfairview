var db, express, indexes, num_indexes, router, utils, _;

express = require('express');

router = express.Router();

router.get('/', function(req, res)
{
	return res.render('admin.ejs', {
		title: 'MyShows'
	});
});

module.exports = router;
