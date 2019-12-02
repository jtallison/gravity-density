class GravSound {
  // Oddly you can insert a filter into the wavesurfer chain
  // connect the filter also to tone.toMaster (or another tone node)
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
    this.loadSample = this.loadSample.bind(this);
    this.playRegion = this.playRegion.bind(this);
    this.wavesurferLoaded = this.wavesurferLoaded.bind(this);
    this.wavesurferVolume = this.wavesurferVolume.bind(this);
    this.setLoop = this.setLoop.bind(this);
    this.moveLoop = this.moveLoop.bind(this);
    this.playLoop = this.playLoop.bind(this);
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.hasLoop = this.hasLoop.bind(this);
    this.masterGain = this.masterGain.bind(this);
    this.playbackRate = this.playbackRate.bind(this);

    if(ctx) {
      // use context in setting up tone...
    }
    this.tone = new Tone();

    this.wavesurfer;
    this.audio;
    this.wavesurferContainer = '#waveform';
    this.wavesurferDiv = document.getElementById('waveform');
    this.waveBox = this.wavesurferDiv.getBoundingClientRect();  // .y, .width = 375
    this.duration = 0.001;

    this.region;
    this.pastRegionDrag = {};

    this.sampleLength = 5;    // in seconds

    
    // Effects and Synths

    this.gain = new Tone.Gain({gain:1.0}).toMaster();

    this.tremolo = new Tone.Tremolo({
      "frequency": 8,
      "type": "sine",
      "depth": 0.6,
      "spread": 0
      //"wet": 0.8
    }).connect(this.gain).start();

    this.feedbackDelay = new Tone.FeedbackDelay("8n", 0.5).connect(this.tremolo);

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
    this.player[0] = new Tone.Player("/data/mp3s/noisybeep-delay.mp3").toMaster();
    this.player[1] = new Tone.Player("/data/mp3s/beep.mp3").toMaster();
    this.player[0].volume.value = -10;
    this.player[1].volume.value = -10;

    Tone.Transport.start();

    this.pitchCollection = [55, 57, 59, 61, 62, 64, 66, 67, 68, 69, 71, 73, 75, 76, 78, 80, 82, 83];

    this.pitch = this.pitchCollection[Math.floor(Math.random() * (this.pitchCollection.length))];
    console.log("Pitch & Length:", this.pitch, this.pitchCollection.length);

    //**** Create wavesurfer ******

    this.wavesurfer = WaveSurfer.create({
      container: this.wavesurferContainer,
      audioContext: this.tone.context,
      fillParent: true,
      waveColor: 'black',  // wavecolor: hub.user.color,
      backgroundColor: 'rgba(253,240,223,0.77)',    // 'rgba(253,240,223,0.77)',
      progressColor: 'rgba(195,127,0,0.75)',
      interact: false,
      plugins: [
        WaveSurfer.regions.create({
          regions: [{
              id: 0,
              start: 0.5,
              end: 1,
              // drag: true,
              // resize: true,
              loop: true,
              color: 'hsla(39, 100%, 38%, 0.75)'
            }]
        })
      ]
    });
    this.wavesurfer.backend.setFilter(this.feedbackDelay);
    this.wavesurfer.setVolume(0.)
  
    // wavesurfer.enableDragSelection({
    //     id: 1,
    //     loop: true
    // });

  };

  //  CONSTRUCTOR Complete //


  masterGain(val) {
    this.gain.gain.setValueAtTime(val, this.tone.context.currentTime, 0.015);
  };

  playbackRate(val) {
    this.wavesurfer.setPlaybackRate(val);
  }

  freq (midi) {
    var note = Tone.Frequency(midi).midiToFrequency(midi);
    // var note = Tone.Frequency(midi).toFrequency();
    // console.log("Midi: ", midi, note)
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
  };

  playSecondSound() {
    this.player[1].start();
    // var pitch = this.pitchCollection[Math.floor(Math.random() * (this.pitchCollection.length))];
    // this.synth.triggerAttackRelease(this.freq(pitch), 5);
    this.playRandomPitch();
  };

  // ****  wavesurfers ****


  loadSample(url, toPlay=false) {
    console.log('Loading Sample: ', url);
    this.wavesurfer.on('ready', () => {this.wavesurferLoaded(toPlay)});
  
    this.wavesurfer.load(url);
  }
  

  wavesurferLoaded(toPlay=false) {
    console.log('Wave Loaded!')
    this.duration = this.wavesurfer.getDuration();
    let waveHeight = this.wavesurferDiv.clientHeight;
    this.wavesurfer.setHeight(waveHeight);
    this.wavesurfer.clearRegions();
    let regEnd = this.duration * 0.75;
    let regStart = this.duration * 0.25;
    this.wavesurfer.addRegion({
      id: 1,
      start: regStart,
      end: regEnd,
      drag: false,
      resize: false,
      loop: true,
      color: 'hsla(39, 100%, 38%, 0.75)'
    });
    // Moving Playback to another button instead of touching the ui.
    // could attach a callback to send selections to people. fun.
    // this.wavesurfers[currentSample].regions.list[0].on('update', this.playRegion(currentSample));
    // this.wavesurfer.regions.list[1].on('update', () => {
    //   // wavesurfer.regions.list[1].play();
    //   this.wavesurfer.regions.list[1].un('update');
    //   this.wavesurfer.regions.list[1].on('update', () => {
    //     this.moveLoop();
    //   });
    // });

    this.region = document.getElementsByClassName('wavesurfer-region')[0]
    this.waveBox = this.wavesurferDiv.getBoundingClientRect();  // .y, .width = 375

        // *** Replace Wavesurfer region drag controls
        // Grab original click location )verify that the finger is on the wavesurfer
    this.region.ontouchstart = (e) => {
      let touchIndex = 0;
      if(e.targetTouches.length > 1) {
        // Figure out which touch is on the wavesurfer.
      }
      this.pastRegionDrag.y = e.targetTouches[touchIndex].clientY;
      this.pastRegionDrag.x = e.targetTouches[touchIndex].clientX;
    }
        // Y drag sizes region, X drag moves it
    this.region.ontouchmove = (e)=> {
      // console.log('ontouchmove', e);
      let touchIndex = 0;
      if(e.targetTouches.length > 1) {
        // Figure out which touch is on the wavesurfer.
      }
      let regionDragScaler = 0.001;
      let regionMin = 0.05;
      let regionDragY = e.targetTouches[touchIndex].clientY;
      let regionDragX = e.targetTouches[touchIndex].clientX;

      console.log('');

      let moveX = ((regionDragX / this.waveBox.width) - (this.pastRegionDrag.x / this.waveBox.width));  // x positions normalized 0.-1.0
      let moveY = (this.pastRegionDrag.y - regionDragY) * regionDragScaler;  // this direction gets larger going upward, smaller downward
      console.log("start:",this.wavesurfer.regions.list[1].start,"moveY:",moveY, "move:X", moveX);
      console.log("clientY:",regionDragY, "clientX", regionDragX);

          // Normalized start and end times
      let newStart = Math.max(0.,((this.wavesurfer.regions.list[1].start / this.duration) - moveY) + moveX);
      let newEnd = Math.min(1.0,((this.wavesurfer.regions.list[1].end / this.duration) + moveY) + moveX);
      
        // Keep it from getting too small
      if (newEnd - newStart < regionMin) {
        if(newStart < (1.0-regionMin)) {
          newEnd = newStart + regionMin;
        } else {
          newStart = newEnd + regionMin;
        }
      }

      this.setLoop(hub.user.name, newStart, newEnd);
      this.moveLoop(hub.user.name, newStart, newEnd);
      // this.wavesurfer.regions.list[1].start = newStart * this.duration;
      // this.wavesurfer.regions.list[1].end = newEnd * this.duration;
      // this.wavesurfer.drawBuffer();

      this.pastRegionDrag.y = regionDragY;
      this.pastRegionDrag.x = regionDragX;
    };


    if(playOnceEnable) {
      this.wavesurfer.regions.list[1].color = 'hsla(39, 100%, 38%, 0.25)';
      this.wavesurfer.regions.list[1].start = 0.;
      this.wavesurfer.regions.list[1].end = this.duration;
      this.wavesurfer.drawBuffer();
      enablePlayOnce();
    } else {
      enableLoop();
      enableTouch();
      enablePlay();
    }

    if(toPlay) {
      this.playRegion();
    }
  };

  play(){
    this.wavesurfer.stop();
    this.wavesurfer.regions.list[1].start = 0.;
    this.wavesurfer.regions.list[1].end = this.duration;
    this.wavesurfer.drawBuffer();
    this.wavesurfer.regions.list[1].loop = false;
    this.wavesurfer.play(0.);
  }
  
  playRegion(currentSample) {
    if (this.hasLoop()) {
      this.wavesurfer.regions.list[1].loop = false;
      this.wavesurfer.regions.list[1].play(0.);
    }
  };

  wavesurferVolume(volume) {
    this.wavesurfers.setValueAtTime(volume, this.tone.context.currentTime, 0.015);
  }

    // Sets this loop region
  setLoop(user=hub.user.name, begin=this.wavesurfer.regions.list[1].start, end=this.wavesurfer.regions.list[1].end) {
    if (begin >= 0. && end <= 1.0) {
      if (this.hasLoop()) {
        this.wavesurfer.regions.list[1].start = begin * this.duration;
        this.wavesurfer.regions.list[1].end = end * this.duration;
        this.wavesurfer.drawBuffer();
      }
    }
  }

  moveLoop(user=hub.user.name, begin=(this.wavesurfer.regions.list[1].start / this.duration), end=(this.wavesurfer.regions.list[1].end / this.duration)) {
    hub.transmit('sample', null, {
      'user': user,
      'val': 'loop',
      'play': false,
      'loopBegin': begin,
      'loopEnd': end
    });
  }

  playLoop() {
    if (this.hasLoop()) {
      this.wavesurfer.regions.list[1].loop = true;
      this.wavesurfer.regions.list[1].playLoop();
    } else {
      console.log('No loop 1');
    }
  }

  pause() {
    this.wavesurfer.pause();
  }

  hasLoop() {
    return ('1' in this.wavesurfer.regions.list)
  }

  isPlaying() {
    return this.wavesurfer.isPlaying();
  }

}
