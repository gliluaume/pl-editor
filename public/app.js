var config = new Vue({
  el: '#config',
  data: {
    confirmAction: false,
    showVideoInPlaylist: true
  },
  methods: { }
});

// playlist controler
var pc = new Vue({
  el:'#main',
  data: {
    days:[],
    selectedDayIndex: undefined,
    isReady: false
  },

  methods : {
    load: function() {
      // peuple la liste des jours:
      var d = new Date(1970,0,01);
      d.setDate(d.getDate() - 5);

      for(var i = 0; i < 7; i++){
        d.setDate(d.getDate() + 1);
        this.days.push({index: i, label: d.toLocaleString(window.navigator.language, {weekday: 'long'}) })
      }
      console.log(this.days);
    },

    ready: function() {
      this.selectedDayIndex = this.days[0];
      pl.load(0, tp.tracks);
      this.isReady = true;
      console.log('ready !');
    },

    savePlaylist: function() {
      pl.save(this.selectedDayIndex);
    },

    changeDay: function(event) {
      this.selectedDayIndex = event.target.selectedIndex;
      pl.load(this.selectedDayIndex, tp.tracks);
    }
  }
});


var pl = new Vue({
  el: '#app',
  data: {
    cfg: config,
    start: 21600,
    end: 86400,
    isMaxSizeReached: false,
    rawPlaylist: [],          // playlist as array of tracks ids    
    enrichedPlaylist: [],     // playlist as array of tracks descriptor with startTime
    tracks: [],               // tracks as described in trackPicker
    trackPositionTodel: null,
    insertDescriptor: {
      index: null,
      direction: 0
    },
    apiDays: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    apiRoot: '/api/playlist/'
  },


  methods: {

    isEmpty: function(){
      return this.rawPlaylist.length === 0;
    },      

    save: function(dayIndex){
      console.log(dayIndex);
      this.$http.patch(this.apiRoot + this.apiDays[dayIndex], JSON.stringify(pl.rawPlaylist))
      .then((response) => {
        console.info('sauvegarde ok');
      }, (response) => {
        console.error(response);
      });
    },


    load: function(dayIndex, tracks) {
      // var apiDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      console.log(pl.apiDays);
      var url = this.apiRoot + this.apiDays[dayIndex];
      console.log('get ' + url);

      pl.$http.get(url)
      .then((response) => {
        console.log(response.data);
        pl.rawPlaylist = response.data;
        if(typeof response.data === 'string')
          pl.rawPlaylist = JSON.parse(response.data);
        console.log(typeof response.data, pl.rawPlaylist);
        pl.tracks = tracks;
        pl.buildPlaylist();
      }, (response) => {
        console.error(response);
      });
    },  

    setToDelete: function(trackPosition) {
      pl.trackPositionTodel = trackPosition;
      console.log('to delete ' + trackPosition +', '+ pl.trackPositionTodel);
    },
    
    deleteTrack: function(index) {
      var delIndex;
      if(index == undefined) {
        console.log('delete track is trackPositionTodel ' + pl.trackPositionTodel);
        delIndex = pl.trackPositionTodel;
      } else {
        delIndex = index;
      }
      
      pl.rawPlaylist.splice(delIndex, 1);
      pl.buildPlaylist();
      pl.trackPositionTodel = null;
      console.log('isEmpty : ' + pl.isEmpty());
    },
    
    setPosition: function(index, direction) {
      console.log('(index, direction) : ' + '(' + index + ', ' + direction + ')');
      pl.insertDescriptor = {
        index: index,
        direction: direction
      };
    },

    buildPlaylist: function() {      
      var enrichedPlaylist = [];
      console.log(pl.rawPlaylist);
      if(pl.rawPlaylist.length > 0) {
        pl.rawPlaylist.forEach(function(trackId) {
          console.log(trackId);
          var track = pl.tracks.filter(function(track) {
            return track.id == trackId;
          }).pop();
          pl.__calculateStartTime(track, enrichedPlaylist);
          console.log(track);
          enrichedPlaylist.push(Object.assign({}, track));
        });
        pl.enrichedPlaylist = enrichedPlaylist;
        console.log('enrichedPlaylist');
        console.log(enrichedPlaylist, enrichedPlaylist.length);

        this.isMaxSizeReached = this.enrichedPlaylist[enrichedPlaylist.length - 1].startTime >= this.end;
        console.log('isMaxSizeReached ' + this.isMaxSizeReached);
      }
    },

    __calculateStartTime: function(newTrack, enrichedPlaylist) {
      if(enrichedPlaylist.length === 0) {
        newTrack.startTime = pl.start;
      } else {
        var lastTrack = enrichedPlaylist[enrichedPlaylist.length - 1];
        newTrack.startTime = lastTrack.startTime + lastTrack.duration;
      }
      newTrack.literalStart = pl.__secondsToHours(newTrack.startTime);
    },

    __secondsToHours : function (secondsFormMidnight) {
      var hours   = Math.floor(secondsFormMidnight / 3600);
      var minutes = Math.floor((secondsFormMidnight - (hours * 3600)) / 60);
      var seconds = secondsFormMidnight - (hours * 3600) - (minutes * 60);

      if (hours   < 10) {hours   = "0"+hours;}
      if (minutes < 10) {minutes = "0"+minutes;}
      if (seconds < 10) {seconds = "0"+seconds;}

      return hours+':'+minutes+':'+seconds;
    }
  }

});

var tp = new Vue({
  el: '#trackpicker',
  data: {
    tracks:['clean'],
    isLoaded: false,
    addingAllowed: true
  },

  ready: function() {
    this.load();
  },

  methods: {
    load: function() {
      console.log('get /api/track');
      this.$http.get('/api/track').then((response) => {
        this.tracks = JSON.parse(response.data);
        console.log(this.tracks);
        //pl.load(this.tracks);
        this.isLoaded = true;
        pc.ready();
      }, (response) => {
        console.error(response);
      });
    },

    isAddingAllowed: function() {
      return !pl.isMaxSizeReached;
    },

    addTrack: function(trackId) {
      console.log('add track : ' + trackId);
      console.log(pl.insertDescriptor);

      var positionInArray = pl.insertDescriptor.direction === -1 ? pl.insertDescriptor.index : pl.insertDescriptor.index + 1;
      console.log('positionInArray : ' + positionInArray);

      pl.rawPlaylist.splice(positionInArray, 0, trackId);
      pl.buildPlaylist();
    }
  }

});

tp.load();
pc.load();
