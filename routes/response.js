var express = require('express');
var router = express.Router();

/* GET response page. */
router.get('/', function(req, res, next) {
  res.render('userResponse');
});

module.exports = router;
