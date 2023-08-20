class GravSound {
  // Oddly you can insert a filter into the wavesurfer chain
  // connect the filter also to tone.toDestination (or another tone node)
  // zero out the wavesurfer volume with wavesurfer.setVolume(0.)
  // then simply use Tone.

  constructor(ctx) {

    // Bind functions with this.
    this.freq = this.freq.bind(this);
    this.playPitch = this.playPitch.bind(this);
    this.playRandomPitch = this.playRandomPitch.bind(this);
    this.triggerPitch = this.triggerPitch.bind(this);
    this.playFirstSound = this.playFirstSound.bind(this);
    this.triggerFirstSound = this.triggerFirstSound.bind(this);
    this.playSecondSound = this.playSecondSound.bind(this);
    this.uploadSample = this.uploadSample.bind(this);
    this.createSample = this.createSample.bind(this);
    this.createUI = this.createUI.bind(this);
    this.playRegion = this.playRegion.bind(this);
    this.loadSample = this.loadSample.bind(this);
    this.loadAllSamples = this.loadAllSamples.bind(this);
    this.wavesurferLoaded = this.wavesurferLoaded.bind(this);
    this.wavesurferVolume = this.wavesurferVolume.bind(this);
    this.setLoop = this.setLoop.bind(this);
    this.playLoop = this.playLoop.bind(this);
    this.masterGain = this.masterGain.bind(this);

    if(ctx) {
      // use context in setting up tone...
    }
    this.tone = Tone;

    this.wavesurfers = [];    // Each of the wavesurfers
    this.audio = [];          // An array of the audio tags!
    this.userSamples = {};    // this.userSamples[user].id => playerSampleCount e.g. the sample number of that username
    // this.loopBeginNX = [];      // all of the Nexusui elements for each sample
    // this.loopEndNX = [];
    this.playNX = [];
    this.recordNX = [];
    this.clearNX = [];

    this.playerSampleCount = 0;   // number of samples taken 
    this.sampleLength = 5;    // in seconds

    // ---- Audio Input
    var liveFeed = new Tone.UserMedia();

    Tone.UserMedia.enumerateDevices().then(function (devices) {
      console.log(devices)
    })
    liveFeed.open().then(function () {
      //promise resolves when input is available
      console.log("Recorder Available")
    });

    // this.audio[0] = document.querySelector('audio');
    this.dest = this.tone.context.createMediaStreamDestination();
    this.recorder = new MediaRecorder(this.dest.stream);

    liveFeed.connect(this.dest);
    // ------

    this.chunks = [];

    this.recorder.ondataavailable = evt => {
      // chunks.push(evt.data);
      for (let i = 0; i < this.playerSampleCount; i++) {
        if (this.chunks[i].recording === true) {
          this.chunks[i].chunks.push(evt.data);
        }
      }
    };

    this.recorder.onstop = evt => {
      let soundBlob = new Blob(this.chunks[this.recorder.userNumber].chunks, {
        type: 'audio/wav; codecs=0'
      });
      // let soundBlob = new Blob(this.chunks[this.recorder.userNumber].chunks, {
      //   type: 'audio/ogg; codecs=opus'
      // });
      this.chunks[this.recorder.userNumber].recording = false;
      for (let i = 0; i < this.playerSampleCount; i++) {
        if (this.chunks[i].recording === true && this.recorder.state === "inactive") {
          this.recorder.start();
        }
      }
      console.log('recording stopped');
      this.audio[this.recorder.userNumber].src = URL.createObjectURL(soundBlob);

      let currentSample = this.recorder.userNumber;
      console.log("currentSample Oustide: ", currentSample);
      console.log("wavesurfer: ", this.wavesurfers[currentSample]);

      this.wavesurfers[currentSample].on('ready', () => {this.wavesurferLoaded(currentSample)});

      this.wavesurfers[currentSample].loadBlob(soundBlob);
      console.log('recording Loaded');

      this.uploadSample(this.recorder.user, currentSample, soundBlob)
    };
    // this.recorder.onstop.bind(this);





    
    // Effects and Synths

    this.gain = new Tone.Gain({gain:1.0}).toDestination();

    this.tremolo = new Tone.Tremolo({
      "frequency": 8,
      "type": "sine",
      "depth": 0.6,
      "spread": 0
      //"wet": 0.8
    }).connect(this.gain).start();

    this.feedbackDelay = new Tone.FeedbackDelay("8n", 0.3).connect(this.tremolo);

    this.synth = new Tone.Synth({
      "oscillator": {
        "type": "sine"
      },
      "envelope": {
        "attack": 2.0,
        "decay": 0.5,
        "sustain": 0.8,
        "release": 2.0
      }
    }).connect(this.feedbackDelay);

    this.synth.volume.value = -10;

    // Players

    this.player = [];
    this.player[0] = new Tone.Player("/data/mp3s/noisybeep-delay.mp3").toDestination();
    this.player[1] = new Tone.Player("/data/mp3s/beep.mp3").toDestination();

    Tone.Transport.start();

    this.pitchCollection = [55, 57, 59, 61, 62, 64, 66, 67, 68, 69, 71, 73, 75, 76, 78, 80, 82, 83];

    this.pitch = this.pitchCollection[Math.floor(Math.random() * (this.pitchCollection.length))];
    console.log("Pitch & Length:", this.pitch, this.pitchCollection.length);


  };

  //  CONSTRUCTOR Complete //






  masterGain(val) {
    this.gain.gain.setValueAtTime(val, this.tone.context.currentTime, 0.015);
  };


  freq(midi) {
    var note = Tone.Midi(midi).toFrequency();
    // console.log("Midi:", midi, note)
    return note;
  };

  // **** Playing Notes **** //
  playPitch(pitch) {
    if (pitch) {
      this.synth.triggerAttackRelease(this.freq(pitch), 0.5);
    } else {
      this.synth.triggerAttackRelease(this.freq(this.pitch), 5);

    }
  };
  
  playRandomPitch() {
    var pitch = this.pitchCollection[Math.floor(Math.random() * (this.pitchCollection.length))];
    this.synth.triggerAttackRelease(this.freq(pitch), 0.5);
  };

  triggerPitch() {
    this.synth.triggerAttackRelease(this.freq(this.pitch), 5);
    hub.send('triggerPitch', {
      'pitch': this.pitch
    });
  };

  playFirstSound() {
    this.player[0].start();
  };

  triggerFirstSound() {
    this.playPitch();
    this.player[0].start();
    // this.seqRandomize();
    hub.send('triggerFirstSound', {
      'pitch': this.pitch
    });

    var elements = document.getElementsByClassName("mainTitle");
    // elements[0].className +=" clicked";
    elements[0].style.backgroundColor = hub.user.color;
  };

  // ****  Events ****

  playSecondSound() {
    this.player[1].start();
    // var pitch = this.pitchCollection[Math.floor(Math.random() * (this.pitchCollection.length))];
    // this.synth.triggerAttackRelease(this.freq(pitch), 5);
    this.playRandomPitch();
  };





  // Various and sundry methods



  createSample(user, sampleLength) {
    // do we already have a sample by this user?
    let isNewUser = !(user in this.userSamples);
    
    let currentSample = this.createUI(user, isNewUser);

    // ---------
      // Reset Chunks for recording this user's sample
      this.chunks[currentSample] = {
        recording: true,
        chunks: []
      };

        // make sure the recorder is running
    if (this.recorder.state === "inactive") {
      this.recorder.start();
    }

    // Passing the current playerSampleCount in as this.recorder.userNumber so that it remains the correct number is multiple records happen.
    let recordingTimer = setTimeout( (user, userNumber) => { // setup a timeout for the recording, after the time below expires, do the tings inside the {}
      this.recorder.user = user;
      this.recorder.userNumber = userNumber;
      console.log("Stopping Recording for: ", user, userNumber);
      this.recorder.stop(); // stop recording
    }, sampleLength * 1000, user, currentSample) //record for sample length (in ms)
    
  };

  createUI(user, isNewUser=true) {
    let currentSample;  // the userSample number of the sample
    console.log("Create new user? ", isNewUser);
    if (isNewUser){
      currentSample = this.playerSampleCount;
      this.userSamples[user] = {}
      this.userSamples[user].id = currentSample;
    } else {
      currentSample = this.userSamples[user].id;
    }
    
        // Prepare userSample divs
    let sampleDiv = document.getElementById("samples");
    let userSampleDiv;
    let newControlDiv;

    if(isNewUser) {
      userSampleDiv = document.createElement("div");
      newControlDiv = document.createElement("div");
    } else {
      // Do we need these?
    }


        // ----- Create New Sample Div sample-001 ----- //
    if(isNewUser) {

      // var url = URL.createObjectURL(blob);
      userSampleDiv.setAttribute("id", "sample-" + currentSample);
      userSampleDiv.setAttribute("class", "userSample");
      newControlDiv.setAttribute('id','sampleControls-'+currentSample);
      newControlDiv.setAttribute("class", "userSampleControls");
      let sampleLabel = document.createElement("span");
      let sampleLabelText = document.createTextNode(`Sample ${currentSample} User ${user}`);
      sampleLabel.setAttribute("class", "userSampleLabel");
      sampleLabel.appendChild(sampleLabelText);
      sampleDiv.appendChild(userSampleDiv);
      userSampleDiv.appendChild(newControlDiv);
      userSampleDiv.appendChild(sampleLabel);
      
      let play = document.createElement("div");
      play.setAttribute("id", "play-" + currentSample);
      play.setAttribute("class", "playUserSample");
      let playLabel = document.createElement("span");
      let playLabelText = document.createTextNode("Play");
      playLabel.setAttribute("class", "playUserSampleLabel");
      playLabel.appendChild(playLabelText);
      newControlDiv.appendChild(playLabel);
      newControlDiv.appendChild(play);
      this.playNX[currentSample] = new Nexus.Toggle("#play-"+ currentSample);

      let clear = document.createElement("div");
      clear.setAttribute("id", "clear-" + currentSample);
      clear.setAttribute("class", "clearUserSample");
      let clearLabel = document.createElement("span");
      let clearLabelText = document.createTextNode("Clear");
      clearLabel.setAttribute("class", "clearUserSampleLabel");
      clearLabel.appendChild(clearLabelText);
      newControlDiv.appendChild(clearLabel);
      newControlDiv.appendChild(clear);
      this.clearNX[currentSample] = new Nexus.Button("#clear-" + currentSample, {'size': [30,30]});
      
      // let loopBegin = document.createElement("div");
      // loopBegin.setAttribute("id", "loopBegin-" + currentSample);
      // let loopBeginLabel = document.createTextNode("Loop Begin");
      // newControlDiv.appendChild(loopBeginLabel);
      // newControlDiv.appendChild(loopBegin);
      // this.loopBeginNX[currentSample] = new Nexus.Number("#loopBegin-" + currentSample, {'min': 0., 'max': 1.0, 'step':0.01, 'decimalPlaces':3});
      // let loopEnd = document.createElement("div");
      // loopEnd.setAttribute("id", "loopEnd-" + currentSample);
      // let loopEndLabel = document.createTextNode("Loop End");
      // newControlDiv.appendChild(loopEndLabel);
      // newControlDiv.appendChild(loopEnd);
      // this.loopEndNX[currentSample] = new Nexus.Number("#loopEnd-" + currentSample, {'min': 0., 'max': 1.0, 'step':0.01, 'decimalPlaces':3});
 
      this.playNX[currentSample].on('change', (v) => {
        if(this.sampleHasLoop(currentSample)) {
          v ? this.wavesurfers[currentSample].regions.list[0].play() : this.wavesurfers[currentSample].pause();
        }
      });
      this.clearNX[currentSample].on('change', (v) => {
        console.log("clear", v);
        v.state ? this.wavesurfers[currentSample].empty() : null;
      });
      // Fix this before using dynamically.
      // this.loopBeginNX[currentSample].on('change', (v) => {
      //   if(v.value < this.wavesurfers[currentSample].regions.list[0].end){
      //     this.wavesurfers[currentSample].regions.list[0].start = v.value;
      //   } else {
      //     this.loopBeginNX[currentSample].passiveUpdate(this.wavesurfers[currentSample].regions.list[0].end);
      //   }
      // })
      // this.loopEndNX[currentSample].on('change', (v) => {
      //   if(v.value > this.wavesurfers[currentSample].regions.list[0].start){
      //     this.wavesurfers[currentSample].regions.list[0].end = v.value;
      //   } else {
      //     this.loopEndNX[currentSample].passiveUpdate(this.wavesurfers[currentSample].regions.list[0].start);
      //   }
      // })

      // Empty Chunk Array.
      this.chunks[currentSample] = {
        recording: false,
        chunks: []
      };
    };

      // Create Audio Tag and Wavesurfer elements
    let au;
    if(isNewUser) {
      au = document.createElement('audio');
      let ws = document.createElement('div');
      ws.setAttribute("id", "waveform-" + currentSample);
      ws.setAttribute('class', 'waveform');
      au.setAttribute("id", 'audio-' + currentSample);
      au.setAttribute('class', 'audiotag');
      // au.controls = 'controls';
      userSampleDiv.appendChild(ws);
      userSampleDiv.appendChild(au);
    }

      // Store the Audio element and initialize the wavesurfer
    if(isNewUser) {
      this.audio[currentSample] = au;
      this.wavesurfers[currentSample] = WaveSurfer.create({
        container: '#waveform-' + currentSample,
        audioContext: this.tone.context,
        waveColor: 'violet',  // waveColor: hub.user.color,
        progressColor: 'purple',
        fillParent: true,
        backgroundColor: 'rgba(253,240,223,0.77)',
        plugins: [
          WaveSurfer.regions.create({
            regions: [{
                    id: 0,
                    start: 1,
                    end: 3,
                    drag: true,
                    color: 'hsla(39, 100%, 38%, 0.75)'
                }]
            // dragSelection: {
            //     slop: 5
            // }
          })
        ]
      });
      this.wavesurfers[currentSample].backend.setFilter(this.feedbackDelay);
      this.wavesurfers[currentSample].setVolume(0.);
    }

        // increment the number of samples
    if(isNewUser) {
      this.playerSampleCount += 1;
    }
    return currentSample;
  }


  uploadSample(user, userNumber, soundBlob) {
    let formdata = new FormData(); //create a from to of data to upload to the server
    let soundFileName = this.recorder.user + '_Sample';
    formdata.append('user', user);
    formdata.append('id', userNumber);
    formdata.append('soundBlob', soundBlob, soundFileName ); // append the sound blob and the name of the file. third argument will show up on the server as req.file.originalname

    // Now we can send the blob to a server...
    let serverUrl = '/upload'; //we've made a POST endpoint on the server at /upload
    let httpRequestOptions = { //build a HTTP POST request
      method: 'POST',
      body: formdata, // with our form data packaged above
      headers: new Headers({
        'enctype': 'multipart/form-data' // the enctype is important to work with multer on the server
      })
    };
    fetch(serverUrl, httpRequestOptions).then(res => {
      console.log(res)
      // hub.transmit('sample', null, null, {'user': user, 'val': 'load', 'url': soundFileName, 'id':userNumber});
    }).then(error => {
      if(error) {
        console.log(error)
      }
    });

    console.log('recording sent');
  };



  // *************** Wavesurfer Methods ***********************

  loadSample(user, url, toPlay=false) {
    console.log('Loading Sample: ', url);
    if (user in this.userSamples) {
      let sampleNumber = this.userSamples[user].id;
      this.wavesurfers[sampleNumber].on('ready', () => {this.wavesurferLoaded(sampleNumber, toPlay)});
    
      this.wavesurfers[sampleNumber].load(url);
    } else {
      // create a wavesurfer - must not have recorded yet.
      this.createUI(user)
      let sampleNumber = this.userSamples[user].id;
      this.wavesurfers[sampleNumber].on('ready', () => {this.wavesurferLoaded(sampleNumber, toPlay)});
    
      this.wavesurfers[sampleNumber].load(url);
    }
  }

  loadAllSamples(url, toPlay=false) {
    console.log('Loading Samples for everyone: ', url);
    Object.entries(this.userSamples).forEach(([username, user])=>{
      let sampleNumber = user.id;
      this.wavesurfers[sampleNumber].on('ready', () => {this.wavesurferLoaded(sampleNumber, toPlay)});
      this.wavesurfers[sampleNumber].load(url);
    });
  };


  wavesurferLoaded(currentSample, toPlay=false) {
    // console.log("currentSample Inside: ", currentSample, this);
    // console.log('This Wavesurfer', this.wavesurfers[currentSample]);
    this.wavesurfers[currentSample].clearRegions();
    let regEnd = this.wavesurfers[currentSample].getDuration() * 0.75;
    let regStart = this.wavesurfers[currentSample].getDuration() * 0.25;
    // console.log("Loop Points", regEnd, regStart)
    this.wavesurfers[currentSample].addRegion({
      id: 0,
      start: regStart,
      end: regEnd,
      drag: true,
      resize: true,
      loop: true,
      color: 'hsla(39, 100%, 38%, 0.75)'
    });
    // Moving Playback to another button instead of touching the ui.
    // could attach a callback to send selections to people. fun.
    // this.wavesurfers[currentSample].regions.list[0].on('update', this.playRegion(currentSample));
  };

  wavesurferVolume(volume) {
    this.wavesurfers.forEach((surfer)=>{
      surfer.setValueAtTime(volume, this.tone.context.currentTime, 0.015);
    });
  }

  playRegion(user) {
    if (user in this.userSamples) {
      let sampleNumber = this.userSamples[user].id;
      this.wavesurfers[sampleNumber].regions.list[0].loop = false;
      this.wavesurfers[sampleNumber].play(this.wavesurfers[sampleNumber].regions.list[0].start, this.wavesurfers[sampleNumber].regions.list[0].end );
    }
  };

  playSample(user) {
    if (user in this.userSamples) {
      let sampleNumber = this.userSamples[user].id;
      this.wavesurfers[sampleNumber].regions.list[0].loop = false;
      this.wavesurfers[sampleNumber].play(0.);
    }
  };

      // Set loop position for specific user base on normalized start/end values
  setLoop(user, begin, end) {
    if (begin >= 0. && end <= 1.0) {
      if (user in this.userSamples) {
        if(this.hasLoop(user)){
          let sampleNumber = this.userSamples[user].id;
          this.wavesurfers[sampleNumber].regions.list[0].start = begin * this.wavesurfers[sampleNumber].getDuration();
          this.wavesurfers[sampleNumber].regions.list[0].end = end * this.wavesurfers[sampleNumber].getDuration();
          this.wavesurfers[sampleNumber].drawBuffer();
          // this.loopBeginNX[sampleNumber].passiveUpdate(begin);
          // this.loopEndNX[sampleNumber].passiveUpdate(end);
        } else {
          console.log('setLoop but no loop for user ', user);
        }
      }
    }
  }

  playLoop(user) {
    if (user in this.userSamples) {
      let sampleNumber = this.userSamples[user].id;
      this.wavesurfers[sampleNumber].regions.list[0].loop = true;
      this.wavesurfers[sampleNumber].regions.list[0].playLoop();
    }
  }

  pause(user) {
    if (user in this.userSamples) {
    let sampleNumber = this.userSamples[user].id;
    this.wavesurfers[sampleNumber].pause();
    }
  }

  hasLoop(user) {
    if (user in this.userSamples) {
      let sampleNumber = this.userSamples[user].id;
      return ('0' in this.wavesurfers[sampleNumber].regions.list);
    } else {
      return false;
    }
  }

  isPlaying(user) {
    if (user in this.userSamples) {
    let sampleNumber = this.userSamples[user].id;
    return this.wavesurfers[sampleNumber].isPlaying();
    }
  }

}