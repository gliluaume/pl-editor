'use strict';

const configuration = {
  playlists: {
    'mon': 'mon.csv', 
    'tue': 'tue.csv', 
    'wed': 'wed.csv', 
    'thu': 'thu.csv', 
    'fri': 'fri.csv', 
    'sat': 'sat.csv', 
    'sun': 'sun.csv'
  },

  tagMapping: {
    'Size': 'Image Size',
    'Duration': 'Duration'
  },

  environment: {
    videoExt: '.mp4',
    plVideoPath: '/home/guillaume/Documents/projets/pl-editor/public/resources',
    plPath: '/home/guillaume/Documents/projets/pl-editor/public/playlist'
  }
};


module.exports = configuration;
