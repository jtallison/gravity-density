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

    if(ctx) {
      // use context in setting up tone...
    }
    this.tone = new Tone();

    this.wavesurfer;
    this.audio;
    this.wavesurferContainer = '#waveform';
    this.wavesurferDiv = document.getElementById('waveform');

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
    this.player[0] = new Tone.Player("/data/mp3s/CD_Track_2.mp3").toMaster();
    this.player[1] = new Tone.Player("/data/mp3s/Collide.mp3").toMaster();

    Tone.Transport.start();

    this.pitchCollection = [55, 57, 59, 61, 62, 64, 66, 67, 68, 69, 71, 73, 75, 76, 78, 80, 82, 83];

    this.pitch = this.pitchCollection[Math.floor(Math.random() * (this.pitchCollection.length))];
    console.log("Pitch & Length:", this.pitch, this.pitchCollection.length);

    //**** Create wavesurfer ******

    this.wavesurfer = WaveSurfer.create({
      container: this.wavesurferContainer,
      audioContext: this.tone.context,
      fillParent: true,
      waveColor: 'violet',  // wavecolor: hub.user.color,
      backgroundColor: 'rgba(253,240,223,0.77)',
      progressColor: 'purple',
      plugins: [
        WaveSurfer.regions.create({
          regions: [{
              id: 0,
              start: 0.5,
              end: 1,
              drag: true,
              resize: true,
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

  };

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
    let waveHeight = this.wavesurferDiv.clientHeight;
    this.wavesurfer.setHeight(waveHeight);
    this.wavesurfer.clearRegions();
    let regEnd = this.wavesurfer.getDuration() * 0.75;
    let regStart = this.wavesurfer.getDuration() * 0.25;
    this.wavesurfer.addRegion({
      id: 1,
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
    this.wavesurfer.regions.list[1].on('update', () => {
      // wavesurfer.regions.list[1].play();
      this.wavesurfer.regions.list[1].un('update');
      this.wavesurfer.regions.list[1].on('update', () => {
        this.moveLoop();
      });
    });
    // enableLoop();
    // enableTouch();
    if(toPlay) {
      this.playRegion();
    }
  };

  play(){
    this.wavesurfer.stop();
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

  setLoop(user, begin, end) {
    if (begin >= 0. && end <= 1.0) {
      if (this.hasLoop()) {
        this.wavesurfer.regions.list[1].start = begin * this.wavesurfer.getDuration();
        this.wavesurfer.regions.list[1].end = end * this.wavesurfer.getDuration();
        this.wavesurfer.drawBuffer();
      }
    }
  }

  moveLoop() {
    hub.transmit('sample', null, {
      'user': hub.user.name,
      'val': 'loop',
      'play': false,
      'loopBegin': gravSound.wavesurfer.regions.list[1].start / gravSound.wavesurfer.getDuration(),
      'loopEnd': gravSound.wavesurfer.regions.list[1].end / gravSound.wavesurfer.getDuration()
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
