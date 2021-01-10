import express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send({ title: 'Express', description: "Welcome to Social media App" });
});

module.exports = router;
