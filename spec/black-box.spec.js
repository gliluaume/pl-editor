'use strict';

const request = require('supertest');
const app = require('../server');
const assert = require('assert');

describe('dummy test', function() {  
  it('test the tests', function() {
    assert.equal(true, true)
  })
})


describe('GET /api/playlist/mon', function() {  
  it('returns an array of integers', function() {
    // newer mocha versions accepts promises as well
    request(app)
      .get('/api/playlist/mon')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res) {
        console.log('response body is', res.body);
        if (err) throw err;
      });
  })
})

// Mal écrit : revoir comment traiter la promesse
// describe('GET /api/track', function() {  
//   it('returns an array of tracks', function() {
//     // newer mocha versions accepts promises as well
//     request(app)
//       .get('/api/track')
//       .set('Accept', 'application/json')
//       .expect(200)
//       .then(response => {
//         console.log('hola?');
//         console.log('response body tracks is', response.body);
//         if (err) throw err;
//       });
//   })
// })
