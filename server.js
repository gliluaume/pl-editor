'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const trace = require('./logger');
const plRepo = require('./pl-repo');
const cfg = require('./configuration');

const port = parseInt(process.argv[2], 10);
const resources = path.join(__dirname, 'public');
const app = express();

app.listen(port);
console.log('listening on', port);

app.use(bodyParser.json());
app.use(trace.req);
app.use('/', express.static(resources));
app.use('/public', express.static(resources))


var tracks = [
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
  plRepo.listFiles().then(function(promises){
    Promise.all(promises)
    .then(results => {
      console.log('resolution globale');
      plRepo.tracks = results;
      console.log('tracks', plRepo.tracks);
      res.send(JSON.stringify(plRepo.tracks));
    })
    .catch(e => {
      console.error(e);
    })
  });
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


app.patch('/api/playlist/:day', (req, res) => {
  console.log('patch', req.url, req.params, req.body);
  let resBody = 'ok';

  let filepaths = [];
  try {
    filepaths = plRepo.savePlaylist(req.params.day, req.body);
  } catch(e){
    res.statusCode = 409;
    resBody = e;
    console.log(e);
  }

  res.send(resBody);
});

/*
Tests à mettre en place:
envoyer un patch de playlist avec un id de track qui n'est pas connu => 409
sauvegarder une playlist vide

*/