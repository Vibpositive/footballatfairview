var List, User, addMatchToUserList, express, isLoggedIn, moment, router, uuid;

express = require('express');

router = express.Router();

List = require('../models/list');

User = require('../models/user');

moment = require('moment');

uuid = require('node-uuid');

isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

addMatchToUserList = function(user, match, operation, next) {
  if (operation === 'push') {
    return User.update({
      _id: user.id
    }, {
      $addToSet: {
        'matchs': match
      }
    }, function(err, numAffected) {
      if (err) {
        return {
          message: err
        };
      } else {
        if (numAffected > 0) {
          return {
            message: 'ok'
          };
        } else {
          return {
            message: '0 rows affected'
          };
        }
      }
    });
  } else {
    return User.findByIdAndUpdate({
      _id: user.id
    }, {
      $pull: {
        'matchs': match
      }
    }, function(err, numAffected) {
      if (err) {
        return {
          message: err
        };
      } else {
        return {
          message: numAffected
        };
      }
    });
  }
};

router.get('/', isLoggedIn, function(req, res) {
  List.find({}, function(err, list) {
    if (err) {
      return console.log(err);
    }
    res.render('index.ejs', {
      message: req.flash('loginMessage'),
      lists: list,
      user: req.user,
      moment: moment,
      title: 'Matches List'
    });
  });
});

router.post('/deactivate', function(req, res) {
  res.send('ok');
});

router.post('/views/create', isLoggedIn, function(req, res) {
  res.render('matchs/create.ejs', {
    title: 'Create a match'
  });
});

router.post('/views/list', isLoggedIn, function(req, res) {
  return List.find({}, function(err, list) {
    console.log(list);
    if (err) {
      res.send(err);
      return;
    }
    res.render('matchs/list.ejs', {
      message: req.flash('loginMessage'),
      lists: list,
      user: req.user,
      moment: moment,
      title: "Matches index"
    });
  });
});

router.post('/views/playerslist', function(req, res) {
  return List.findOne({
    _id: req.body.list_id
  }, function(err, list) {
    console.log(list);
    if (err) {
      res.send(err);
      return;
    }
    res.render('matchs/names/names_list.ejs', {
      message: req.flash('loginMessage'),
      list: list,
      user: req.user,
      moment: moment,
      title: "Matches index"
    });
  });
});

router.post('/participate', isLoggedIn, function(req, res) {
  var datetime, first_name, full_name, last_name, list_id, player_id;
  player_id = req.user.facebook.id;
  datetime = 'date';
  last_name = req.user.facebook.last_name;
  first_name = req.user.facebook.first_name;
  full_name = req.user.facebook.first_name + " " + req.user.facebook.last_name;
  list_id = req.body.list_id;
  if (req.body.player_status === 'true') {
    addMatchToUserList(req.user, list_id, 'push');
    return List.update({
      '_id': list_id
    }, {
      $addToSet: {
        'names': {
          player_id: player_id,
          datetime: datetime,
          last_name: last_name,
          first_name: first_name,
          full_name: full_name,
          status: 'playing'
        }
      }
    }, function(err, numAffected) {
      if (err) {
        return res.send('err: ' + String(err));
      } else {
        if (numAffected > 0) {
          return res.json({
            message: 'ok'
          });
        } else {
          res.json({
            message: '0 rows affected'
          });
        }
      }
    });
  } else {
    addMatchToUserList(req.user, list_id, 'pull');
    return List.findByIdAndUpdate({
      '_id': list_id
    }, {
      $pull: {
        'names': {
          full_name: full_name
        }
      }
    }, function(err, model) {
      if (err) {
        return res.send('err: ' + String(err));
      } else {
        return res.send(model);
      }
    });
  }
});

router.get('/match/:listid', isLoggedIn, function(req, res) {
  var listid;
  listid = req.params.listid;
  List.find({
    '_id': listid,
    'names': {
      $elemMatch: {
        'full_name': req.user.facebook.full_name
      }
    }
  }, function(err, sec_res) {
    var player_on_list;
    player_on_list = sec_res.length <= 0 ? false : true;
    return List.findOne({
      _id: listid
    }, function(err, list) {
      if (err) {
        console.log(err);
        return;
      }
      res.render('lists/list.ejs', {
        message: req.flash('loginMessage'),
        list: list,
        match_date: moment(list.date).format("dddd, MMMM Do YYYY, h : mm : ss a"),
        user: req.user,
        player_on_list: player_on_list,
        moment: moment,
        disabled: list.list_status === 'deactivate' ? 'disabled' : '',
        title: "Match"
      });
    });
  });
});

router.get('/match/details/:listid', isLoggedIn, function(req, res) {
  List.findOne({
    _id: req.params.listid
  }, function(err, list) {
    if (err) {
      console.log(err);
      return;
    }
    res.render('lists/list_details.ejs', {
      message: req.flash('loginMessage'),
      list: list,
      match_date: moment(list.date).format("dddd, MMMM Do YYYY, h : mm : ss a"),
      user: req.user,
      title: "Match: details"
    });
  });
});

router.post('/match/create', isLoggedIn, function(req, res, next) {
  var errMessage, isParticipating, list_date, list_size, list_status, match, names;
  isParticipating = req.body.names;
  if (isParticipating === 'true') {
    names = [
      {
        player_id: req.user.facebook.id,
        datetime: 'date',
        last_name: req.user.facebook.last_name,
        first_name: req.user.facebook.first_name,
        full_name: req.user.facebook.first_name + " " + req.user.facebook.last_name,
        status: 'playing'
      }
    ];
  } else {
    names = [];
  }
  list_date = req.body.list_date;
  list_size = req.body.list_size;
  list_status = req.body.list_status;
  errMessage = '';
  match = new List({
    list_date: list_date,
    list_size: list_size,
    names: names,
    list_status: list_status,
    date: Date.now(),
    url: uuid.v1()
  });
  return match.save(function(err) {
    var errName;
    if (err) {
      for (errName in err.errors) {
        errMessage += err.errors[errName].message;
      }
      res.send(errMessage);
    } else {
      res.send(match._id);
    }
  });
});

router.post('/match/edit/status', isLoggedIn, function(req, res, next) {
  var list_id, list_status;
  list_id = req.body.list_id;
  list_status = req.body.list_status;
  return List.update({
    _id: list_id
  }, {
    'list_status': String(list_status)
  }, function(err, numAffected) {
    if (err) {
      return {
        message: err
      };
    } else {
      if (numAffected > 0) {
        res.send({
          message: 'ok'
        });
      } else {
        res.send({
          message: '0 rows affected'
        });
      }
    }
  });
});

router.post('/match/edit/match', function(req, res, next) {
  var list_id, player_id, player_status;
  list_id = req.body.list_id;
  player_status = req.body.player_status;
  player_id = req.body.player_id;
  return List.update({
    '_id': list_id,
    "names.player_id": player_id
  }, {
    '$set': {
      'names.$.status': player_status
    }
  }, function(err, numAffected) {
    if (err) {
      return res.send('err: ' + String(err));
    } else {
      if (numAffected > 0) {
        return res.json({
          message: 'ok'
        });
      } else {
        res.json({
          message: '0 rows affected'
        });
      }
    }
  });
});

router.post('/match/edit/:listid', function(req, res, next) {
  var listid;
  listid = req.params.listid;
  return List.findOne({
    _id: listid
  }, {}, function(err, listFound) {
    if (err) {
      return {
        message: err
      };
    } else {
      res.render('matchs/match_edit.ejs', {
        message: '',
        list: listFound,
        user: req.user,
        moment: moment,
        title: 'Matches List'
      });
    }
  });
});

module.exports = router;
