'use strict';
const express = require('express');
const path = require('path');
const trace = require('./logger');

const port = parseInt(process.argv[2], 10);
const resources = path.join(__dirname, 'public');
const app = express();

app.listen(port);
console.log('listening on', port);

app.use(trace);
app.use('/', express.static(resources))





const tracks = [
  {
  'id': 9,
  'filepath': 'resources/CAP_0009_180630.mp4',
  'alias': 'LE WHARLF DE BASSAM.mpg.mobile1080p_H264_@_MP3_@.MPEG4.MP4',
  'title': 'Test capsule',
  'description': 'Capsule en HD',
  'typeDesc': 'Capsule',
  'duration':180
  },
  {
  'id': 7,
  'filepath': 'resources/CAP_0007_180630.mp4',
  'alias': 'La pirogue de génération Félix Houphouët Boigny appelée FA ELE ou ABY SALAMAN .mpg.mobile1080p_H264_@_MP3_@.MPEG4.MP4',
  'title': 'Ma première capsule',
  'description': 'La pirogue de génération Félix Houphouët Boigny',
  'typeDesc': 'Capsule',
  'duration':181
  },
  {
  'id': 3,
  'filepath': 'resources/CAP_0003_180630.mp4',
  'title': 'Ma deuxième capsule',
  'alias': 'ROYAUME DU SANWI.mpg.mobile1080p_H264_@_MP3_@.MPEG4.MP4',
  'description': 'Le royaume du Sanwi',
  'typeDesc': 'Publicité',
  'duration':180
  }
];

app.get('/api/track', (req, res) => {
  res.send(JSON.stringify(tracks));
});



const playlists = {
  'mon' : [9, 7, 3, 7, 9], 
  'tue' : [9], 
  'wed' : [7], 
  'thu' : [3, 7], 
  'fri' : [7, 9], 
  'sat' : [], 
  'sun' : [7]
};

app.get('/api/playlist/:day', (req, res) => {
  res.send(playlists[req.params.day]);
});
