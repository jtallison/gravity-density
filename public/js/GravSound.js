class GravSound {
  // Oddly you can insert a filter into the wavesurfer chain
  // connect the filter also to tone.toDestination (or another tone node)
  // zero out the wavesurfer volume with wavesurfer.setVolume(0.)
  // then simply use Tone.  --- NOTE: this was with the previous version of Wavesurfer, latest version 
  // Latest version simply connects to the <audio> source.

  constructor(ctx) {

  { //  ***** Initialize properties & Methods .....
      // Bind Methods with this.
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
    this.loopHasMoved = this.loopHasMoved.bind(this);
    this.playLoop = this.playLoop.bind(this);
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.hasLoop = this.hasLoop.bind(this);
    this.updateLoop = this.updateLoop.bind(this);
    this.masterGain = this.masterGain.bind(this);
    this.playbackRate = this.playbackRate.bind(this);
    this.createWaveformUI = this.createWaveformUI.bind(this);

      // Properties
    this.wavesurfer;
    this.wsRegions;
    this.wavesurferContainer = '#waveform';
    this.wavesurferDiv = document.getElementById('waveform');
    this.waveBox = this.wavesurferDiv.getBoundingClientRect();  // .y, .width = 375
    this.duration = 0.001;

    this.loop = true;
    this.loopWidth = 0.5;
    this.loopMoving = false;
    this.regionDragScaler = 0.001; // speed up or slow down y based width changes
    this.regionMin = 0.05; // as small as it goes
    this.region;
    this.activeRegion = null;
    this.pastRegionDrag = {};

    this.sampleLength = 5;    // in seconds
  }

  { //  ***** Tone & Audio Setup ......
       
    if(ctx) {
      // use context in setting up tone...
    }
    this.tone = Tone;   // Simple reference to all Tone functions

      //  ***** Audio Source ........
    this.audio = new Audio();
    this.audio.controls = true;
    this.audio.src = '/data/mp3s/sp-primaryFunctions.mp3';
    // document.appendChild(this.audio);
    this.mediaNode;

      // Effects and Synths
    this.gain = new Tone.Gain({gain:1.0});

    this.tremolo = new Tone.Tremolo({
      "frequency": 8,
      "type": "sine",
      "depth": 0.6,
      "spread": 0
      //"wet": 0.8
    }).start();

    this.feedbackDelay = new Tone.FeedbackDelay("8n", 0.3);

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
    });

    // ***** Connect Audio Chain .....

    // Connect the audio to the effects chain
    this.audio.addEventListener(
      'canplay',
      () => {
        // Create a MediaElementSourceNode from the audio element
        // this.mediaNode = Tone.context.createMediaElementSource(this.audio)
        this.mediaNode = new Tone.MediaElementSource(this.audio);

        this.mediaNode.connect(this.feedbackDelay);
        this.synth.connect(this.feedbackDelay);
        this.feedbackDelay.connect(this.tremolo);
        this.tremolo.connect(this.gain);
        this.gain.toDestination();
      },
      { once: true },
    )

    this.synth.volume.value = -15;

    // Tone Players

    this.player = [];
    this.player[0] = new Tone.Player("/data/mp3s/noisybeep-delay.mp3").toDestination();
    this.player[1] = new Tone.Player("/data/mp3s/beep.mp3").toDestination();
    this.player[0].volume.value = -18;
    this.player[1].volume.value = -10;

    Tone.Transport.start();

    this.pitchCollection = [55, 57, 59, 61, 62, 64, 66, 67, 68, 69, 71, 73, 75, 76, 78, 80, 82, 83];

    this.pitch = this.pitchCollection[Math.floor(Math.random() * (this.pitchCollection.length))];
    console.log("Pitch & Length:", this.pitch, this.pitchCollection.length);

  }  
  
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

  freq(midi) {
    var note = Tone.Midi(midi).toFrequency();
    // var note = Tone.Frequency(midi).toFrequency();
    // console.log("Midi: ", midi, note)
    return note;
  };

  // **** Playing Notes **** //
  playPitch(pitch=this.pitch, dur=0.5) {
    // if (pitch) {
    this.synth.triggerAttackRelease(this.freq(pitch), dur);
    // } else {
    //   this.synth.triggerAttackRelease(this.freq(this.pitch), 5);
    // }
  };
  
  playRandomPitch() {
    var pitch = this.pitchCollection[Math.floor(Math.random() * (this.pitchCollection.length))];
    this.playPitch(pitch, 0.5);
  };

  triggerPitch() {
    this.playPitch();
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



    // ***** Create and setup WaveformUI ........
  createWaveformUI () {
    //**** Create wavesurfer ******
    console.log("WavesurferContainer: ", this.wavesurferContainer, " div: ", this.wavesurferDiv);
    this.wavesurfer = WaveSurfer.create({
      container: this.wavesurferContainer,
      // audioContext: this.tone.context,
      fillParent: true,
      height: 'auto',
      waveColor: 'black',  // wavecolor: hub.user.color,
      // backgroundColor: 'rgba(253,240,223,0.77)',    // 'rgba(253,240,223,0.77)',
      progressColor: 'rgba(195,127,0,0.75)',
      interact: false,
      media: this.audio
    });
    // this.wavesurfer.backend.setFilter(this.feedbackDelay);
    // this.wavesurfer.setVolume(0.)  // no longer needed with latest version of wavesurfer
      // ***** Create Wavesurfer Regions
    this.wsRegions = this.wavesurfer.registerPlugin(WaveSurfer.Regions.create())
    this.wavesurfer.once('decode', () => {
      // Regions
      let regEnd = this.duration * 0.75;
      let regStart = this.duration * 0.25;

      this.region = this.wsRegions.addRegion({
        id: 1,
        start: regStart,
        end: regEnd,
        drag: false,
        resize: false,
        // loop: true,
        color: 'hsla(39, 100%, 38%, 0.75)'
      });

        // Make Loop -- 
      this.wsRegions.on('region-in', (region) => {
        console.log('region-in', region)
        this.activeRegion = region;
      })
      this.wsRegions.on('region-out', (region) => {
        console.log('region-out', region)
        if (this.activeRegion === region) {
          if (this.loop) {
            region.play()
          } else {
            this.activeRegion = null
          }
        }
      })
      this.wsRegions.on('region-clicked', (region, e) => {
        e.stopPropagation() // prevent triggering a click on the waveform
        console.log('region-clicked', region, e)
        this.activeRegion = region
        // region.play()
        this.pastRegionDrag.y = e.clientY;
        this.pastRegionDrag.x = e.clientX;
      })
      this.wsRegions.on('interaction', () => {
        console.log('interaction', region)
        this.activeRegion = null
      })

      // this.region.on('update', (e)=> {
      //   console.log('update', e);
      // })

          // ****** Handling region touch & drag movements
      this.region.element.ontouchstart = (e) => {
        e.preventDefault();
        console.log('touchstart', e)
        let touchIndex = 0;
        if(e.targetTouches.length > 1) {
          // Figure out which touch is on the wavesurfer.
        }
        this.pastRegionDrag.y = e.targetTouches[touchIndex].clientY;
        this.pastRegionDrag.x = e.targetTouches[touchIndex].clientX;
      }
      this.region.element.onmousedown = (e) => {
        console.log('mousedown', e)
        this.pastRegionDrag.y = e.clientY;
        this.pastRegionDrag.x = e.clientX;
      }
        // Y drag sizes region, X drag moves it
      this.region.element.ontouchmove = (e)=> {
        console.log('touchmove', e);
        e.preventDefault();
        if(touchEnable) {

          // console.log('ontouchmove', e);
          let touchIndex = 0;
          if(e.targetTouches.length > 1) {
            // Figure out which touch is on the wavesurfer.
          }
          let regionDragY = e.targetTouches[touchIndex].clientY;
          let regionDragX = e.targetTouches[touchIndex].clientX;
          this.region.moving(regionDragX, regionDragY);
        }
      };
      this.region.element.onmousemove = (e)=> {
        console.log('mousemove', e)
        if(touchEnable) {
          let regionDragY = e.clientY;
          let regionDragX = e.clientX;
          this.region.moving(regionDragX, regionDragY);
        }
      };


      this.region.moving = (regionDragX, regionDragY) => {
          console.log('moving', regionDragX, regionDragY);
        
        let directXNorm = (regionDragX / this.waveBox.width) // Normalized x touch position

        // let moveX = (directXNorm - (this.pastRegionDrag.x / this.waveBox.width));  // x positions normalized 0.-1.0
        let moveY = (this.pastRegionDrag.y - regionDragY) * this.regionDragScaler;  // this direction gets larger going upward, smaller downward
        // console.log("start:",this.hasLoop().start,"moveY:",moveY, "move:X", moveX);
        // console.log("clientY:",regionDragY, "clientX", regionDragX);
        
        // Normalized start and end times from movements
        // let newStart = Math.max(0.,((this.hasLoop().start / this.duration) - moveY) + moveX);
        // let newEnd = Math.min(1.0,((this.hasLoop().end / this.duration) + moveY) + moveX);

        // Directly calculated start and end times
        this.loopWidth = this.loopWidth + moveY;
        let newStart = Math.max(0., (this.loopWidth / -2.) + directXNorm) // x position - half loop width
        let newEnd = Math.min(0.99999, (this.loopWidth / 2.) + directXNorm)    // x position + half loop width
        console.log('loopWidth', this.loopWidth, directXNorm);

          // keep it from pushing too far to the right
        if (directXNorm > (0.99999 - (this.regionMin/2.0))) {
          if(newStart > (0.99999 - this.regionMin)) {
            newStart = 0.99999 - this.regionMin; 
          }
        } else if (directXNorm < this.regionMin/2.0) {
          if (newEnd < this.regionMin) {
            newEnd = this.regionMin;
          }
        }

        // Keep it from getting too small
        if (newEnd - newStart < this.regionMin) {
          if(newStart < (0.99999-this.regionMin)) {
            newEnd = newStart + this.regionMin;
          } else {
            newStart = newEnd - this.regionMin;
          }
          this.loopWidth = this.regionMin;
        }
        
        this.setLoop(hub.user.name, newStart, newEnd); // normalized start and end values
  
        this.pastRegionDrag.y = regionDragY;
        this.pastRegionDrag.x = regionDragX;
      }

    });
  }

  // ****  wavesurfers ****

      // Load sample by url...
  loadSample(url, toPlay=false) {
    console.log('Loading Sample: ', url);
    this.wavesurfer.on('ready', () => {this.wavesurferLoaded(toPlay)});
    this.wavesurfer.load(url);
    controlBlurring(true);
  }
  
      // Once loaded, prep for playing
  wavesurferLoaded(toPlay=false) {
    console.log('Wave Loaded!')
    controlBlurring(false);
    this.duration = this.wavesurfer.getDuration();
    this.region.totalDuration = this.duration;

    let regEnd = this.duration * 0.75;
    let regStart = this.duration * 0.25;
    if(toPlay) {
      regEnd = this.duration;
      regStart = 0.;
    }
    this.region.end = regEnd;
    this.region.start = regStart;
   // prior region setting - moved to waveform ui decode after creation

    this.waveBox = this.wavesurferDiv.getBoundingClientRect();  // .y, .width = 375

    setInstruction(currentInstruction);

    if(playOnceEnable) {
      this.updateLoop({
        start:0., 
        end: this.duration,
        color: 'hsla(39, 100%, 38%, 0.25)'
      });
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
    if(this.isPlaying()) {
        this.pause();
      }
    this.updateLoop({
      start:0., 
      end: this.duration
    });

    this.loop = false;
    this.wavesurfer.play(0.);
  }
  
  playRegion(currentSample) {
    if (this.hasLoop()) {
      if(this.isPlaying()) {
        this.pause();
      }
      this.loop = false;
      this.hasLoop().play(0.);
    }
  };

  playLoop() {
    if (this.hasLoop()) {
      if(this.isPlaying()) {
        this.pause();
        console.log('already playing - stopping');
      }
      this.loop = true;
      // this.hasLoop().play();
      this.wavesurfer.play(0.);
    } else {
      console.log('No loop 1');
    }
  }

  pause() {
    this.wavesurfer.pause();
    if (!loopEnable){
      this.loop = false;
    }
  }

  wavesurferVolume(volume) {
    this.wavesurfers.setValueAtTime(volume, this.tone.context.currentTime, 0.015);
  }

    // Update the Loop and redraw
  updateLoop(options = {start: this.hasLoop().start, end: this.hasLoop().end}){
    this.hasLoop().setOptions(options);
  }
    // Sets this loop region to Normalized begin and end
  setLoop(user=hub.user.name, beginNorm=(this.hasLoop().start / this.duration), endNorm=(this.hasLoop().end / this.duration)) {
    console.log('setLoop', beginNorm, endNorm);
    if (beginNorm >= 0. && endNorm <= 1.0) {
      if (this.hasLoop()) {
        this.region.start = beginNorm * this.duration;
        this.region.end = endNorm * this.duration;
          // Use if you need to limit region changes to every 100ms.....
        if(!this.loopMoving) {
          setTimeout(() => {
            let begin = this.region.start;
            let end = this.region.end;
            this.updateLoop({start: begin, end: end}) // or move out of timeout if not responsive enough
            this.loopHasMoved(hub.user.name, begin / this.duration, end / this.duration); // send normalized positions
            // this.wavesurfer.drawBuffer();
            this.loopMoving = false;
          }, 100);
          this.loopMoving = true;
        }
      }
    }
  }
    // Transmit normalized buffer positions to server
  loopHasMoved(user=hub.user.name, begin=(this.hasLoop().start / this.duration), end=(this.hasLoop().end / this.duration)) {
    hub.transmit('sample', null, {
      'user': user,
      'val': 'loop',
      'play': false,
      'loopBegin': begin,
      'loopEnd': end,
      'duration': this.duration
    });
  }

    // Return the loop if it exists otherwise undefined
  hasLoop() {
    let loop = this.region;
    // if ('0' in this.wsRegions.getRegions()) {
    //   loop = this.wsRegions.getRegions()[0];
    // }
    return (loop)
  }

  isPlaying() {
    return this.wavesurfer.isPlaying();
  }

}
