'use strict';

var trace = function(req, res, next) {
  console.log(req.url);
  next();
};

 module.exports = trace;
