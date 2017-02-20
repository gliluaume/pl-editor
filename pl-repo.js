'use strict';

const fs = require('fs');
const exec = require('child_process').exec;

// Configuration
const configuration = require('./configuration');
const tagMapping = configuration.tagMapping;
const playlists = configuration.playlists;



const path = require('path');
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
  videoFiles: [],
  listFiles : function() { 
    return new Promise((resolve, reject) => {
      fs.readdir(videoDir, function(error, files) {
        var ret = files.filter(function(file) {
          return path.extname(file) === videoExt && file.match(/^[A-Z]*_/) && file.split('_').length >= 3;
        }).map(function(filename) {
          return trackDescBuilder(filename);
        });
        resolve(ret);
      });
    });
  }
};

module.exports = plRepo;
