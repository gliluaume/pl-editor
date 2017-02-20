'use strict';

var trace = {
  req: function(req, res, next) {
    console.log('request', req.url);
    next();
  }
};



module.exports = trace;
