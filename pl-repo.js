'use strict';

const fs = require('fs');
const dateFormat = require('date-format');
const exec = require('child_process').exec;
const path = require('path');

// Configuration
const cfg = require('./configuration');
const tagMapping = cfg.tagMapping;
const playlists = cfg.playlists;

const videoDir = path.join(__dirname, 'public/resources');
const publicDir = path.join(__dirname, 'public/');
const videoExt = '.mp4';

var trackDescBuilder = function(filename, callback) {
  var metaTagMap = function(stdout) {
    let lines = stdout.split('\n');
    lines.forEach((line) => {
      if(line.length > 0) {
        let keyValue = line.split(' : ');
        let key = keyValue[0].trimRight().trimLeft(), value = keyValue[1].trimRight().trimLeft();

        if(key === 'Duration') {
          this.literalDuration = value;
        }
      }
    });
  };
  
  var extractMetadata = function() {
    return new Promise((resolve, reject) => {
      var cmdPrms = '';
      for(var i in tagMapping) {
        cmdPrms += '^' + tagMapping[i] + '|';
      }
      cmdPrms = cmdPrms.slice(0, cmdPrms.length-1)
      cmdPrms = `exiftool ${publicDir + this.filepath} | grep -E "${cmdPrms}"`;

      exec(cmdPrms, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          reject();
          return;
        }
        metaTagMap.call(this, stdout);
        resolve(this);
      });
    });
  };

  var splittedName = filename.split('_');

  var trackDesc = {
    id: parseInt(splittedName[1], 10),
    filepath: path.join('resources', filename),
    typeDesc: splittedName[0],
    duration: Math.round(parseInt(splittedName[2].split('.')[0], 10) / 1000),
    alias: null,
    title: null,
    description: null
  };

  return extractMetadata.call(trackDesc)
};

var plRepo = {
  tracks: [],
  listFiles : function() { 
    return new Promise((resolve, reject) => {
      fs.readdir(videoDir, function(error, files) {
        var ret = files.filter(function(file) {
          return path.extname(file) === videoExt && file.match(/^[A-Z]*_/) && file.split('_').length >= 3;
        }).map(function(filename) {
          return trackDescBuilder(filename);
        });
        plRepo.tracks = ret;
        resolve(ret);
      });
    });
  },

  calculatePlaylist: function(day, trackIds) {
    let playlistFile = path.join(cfg.environment.plPath, cfg.playlists[day]);

    var playlistDesc = {};
    plRepo.tracks.forEach(function(track) {
      playlistDesc[track.id] = track.filepath;
    });

    var filepaths = [];
    trackIds.forEach(function(trackId) {
      // trackId=1234;
      let trackpath = playlistDesc[trackId];

      if(!trackpath)
        throw `track id ${trackId} unknown !`;    
      
      filepaths.push(path.join(cfg.environment.plVideoPath, trackpath));
    });

    return filepaths;
  },

  writePlaylistFile: function(playlistpath, trackpaths, callback) {
    let text = '';

    if(trackpaths.length > 0) {
      text = trackpaths.reduce(function(acc, elt) {
        return acc + '\n' + elt;
      });
    } 

    fs.writeFile(playlistpath, text, (err) => {
      if (err) throw err;
      console.log('file saved.');
      if(callback) callback();
    });

  },

  formatDate: function() {
    return dateFormat.asString('yyyy-MM-dd-hhmmss.SSS', new Date());
  },

  writePlaylist: function(playlistpath, trackpaths, callback) {
    console.log('writePlaylist in', playlistpath, trackpaths);
    if(fs.existsSync(playlistpath)) {
      let newName = `${playlistpath}-${plRepo.formatDate()}`;
      console.log('rename old file to ', newName);
      fs.rename(playlistpath, newName, function() {
        plRepo.writePlaylistFile(playlistpath, trackpaths, callback);
      });
    } 
    else {
      console.log('writing a new file');
      plRepo.writePlaylistFile(playlistpath, trackpaths, callback);
    }
  },

  savePlaylist: function(day, trackIds) {
    let playlistpath = path.join(cfg.environment.plPath, cfg.playlists[day]);
    var trackpaths;

    if(plRepo.tracks.length < 2) {
      plRepo.listFiles().then(function(promises){
        Promise.all(promises)
        .then(results => {
          plRepo.tracks = results;
          trackpaths = plRepo.calculatePlaylist(day, trackIds);
          plRepo.writePlaylist(playlistpath, trackpaths, () => {
            return trackpaths;
          });
        })
        .catch(e => {
          throw 'accessing files failed.'
        })
      });
    } 
    else {
      trackpaths = plRepo.calculatePlaylist(day, trackIds);
      plRepo.writePlaylist(playlistpath, trackpaths, () => {
        return trackpaths;
      });
    }
  }
};

module.exports = plRepo;
