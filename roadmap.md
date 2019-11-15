
# Gravity|Density

What needs to be done, should be done, could be done.


## TO REPAIR:

- [ ] Audio files can be saved easily as .ogg and used on laptops and Android, but not on iOS devices. They can be saved as .wav and used on all 3, but it has a large file size -- also, right now the .wav file headers are not formatted properly and still won't load on iOS devices... simply opening them in an audio app and re-saving them allows them to be loaded -- Ergo, either fix the wav file corruption, or set up a service on the server that takes the blobs and compresses them using ffmpg to create mp3 files.
One of these will work: https://www.gettoby.com/p/nsw633902rsm


## TODO:

- [ ] battle test wavesurfer usage. Make loop points fully functional  https://www.gettoby.com/p/sf4gx56916kf
- [ ] Create UI for me as an ensemble sample performer (see list below)
- [ ] Implement audience - mute, reset/clear, instruction layer, sample playback w/ illumination, receiving and loading samples.
- [ ] Add event emitter to: all the things   https://www.gettoby.com/p/dtklyqd75qs1 add node eventemitter package  https://medium.com/technoetics/node-js-event-emitter-explained-d4f7fd141a1a  https://www.npmjs.com/package/events  


## Audience UI

- [ ] find font/text style that is NASA friendly
- [ ] Orbital Logo to interact with (via gravitdesigner)
- [ ] 

## Hub UI

- [ ] Clear Audio at once
- [ ] Clear Audio by individual over time
- [ ] Trigger Launch (all at once)
- [ ] Enable Sampling all at once
- [ ] Enable Sampling individually over time
- [ ] Create map of locations - use #seatMap svg to insert audience members and click to select with in certain radius
- [ ] ..

[Gravit Designer](https://designer.gravit.io/) => [SVGArtista](https://svgartista.net/) => [SVGOMG](https://jakearchibald.github.io/svgomg/)



## Sections

__Pre-concert__
- [ ] star field - floating blits.
- [ ] small blip sounds when popping stars.
- [ ] trigger other sound on someone nearby phone when you clear the area.
- [ ] text: Welcome performer density loading... {section: preConcert}
- [ ] text: designing experience...
- [ ] text: initiating gravity...
- [ ] text: Gravity|Density (fade out)


_Spoken-Opening_

- [ ] {section: spokenOpening}
- [ ] text: rotating space text quotes.
- [ ] Anthony CD Master - only cds possibly on voices JFK, Armstrong, 
- [ ] atm | cd hactivision
- [ ] jta | record samples of text speech  {fade: 1.0 30000}
- [ ] jta | push text to audience and trigger in crowd {.play individuals, then groups .play}
- [ ] atm | sputnik on earth clips
- [ ] countdown - played on CD played over all audience members {.load, .play }{section: countdown}
- [ ] text: countdown

_LAUNCH_
- [ ] {section: launch}
- [ ] Rocket launch sounds {.load, .play}
- [ ] shift launch to audience phones
- [ ] die out to space section {fade: 0 10000}

_SPACE_

shift of scale - vast expanse 

- [ ] {section: space} {fade: -6 10000} (db)
- [ ] text: in space, no one can hear you dream.
- [ ] enable audience phone capturing & playback (stagger enabling) {enable.record}
- [ ] sputnik ping sounds very sparse 
- [ ] Audience captures and plays with sounds
- [ ] jta | clear and re-enable capturing, start shifting pitches towards {clear, enable.record}
- [ ] atm | bring in pitched pad
- [ ] atm | bring in cassini radio sounds

_Gravity_

- [ ] {section: gravity}
- [ ] text: attraction to the other
- [ ] atm | Playing musical samples
- [ ] jta | enable small groups to sample and play
- [ ] jta | enable the touch between devices for the other people {section: touch}

__Post-Concert__

- [ ] {section: postConcert}
- [ ] {fade: out}
- [ ] text: Gravity|Density




## Bendit Board Stuff

- [ ] Make ribbon cable for pedal pot wiring
- [ ] Build thrid board to control pedal stomp switch
- [ ] Make ribbon cable for pedal stop switch wiring
- [ ] Add third board controls into performance interface

## Sound Gathering

- delay pedal
- satellite sounds pings, etc.
- LIGO  sounds - measuring gravity
- Spudnik pings 

## CHECK:

- ch1 board 2 not fully swinging 0-100kOhms

## BendIt.io integration

- Analyze code for BendIt make folding path
- shift core functionality to it's own nexusHub instance
- Update UI for full BendIt.io board functionality
- buildout communication between nexusHubs



## Docs

### Channels

~~~
message => {
  .val: [options, ...]
  .duration: value (unit)
}

sample(data) => {
  user: "name"
  url: "sample-1.wav"
  val:  "load", 'capture'
  duration: 5 (sec)
}

sample(data) => {
  user: "name"
  val:  "loop"
  play: boolean
  loopBegin:  0.25 (normalized position)
  loopEnd:    0.75 (normalized position)
}

sample(data) => {
  user: "name"
  val:  "playLoop"
}

sample(data) => {
  user: "name"
  val:  "play"
}

sharedSlider(data) => {
  value: 0.
}



enable = {
  val: [record, loop, touch],
  enabled: boolean,
  user: [all, name]
}
~~~

~~~
gravity = {
  section: [preConcert, spokenOpening, countdown, launch, space, gravity, postConcert]
  volume: 1.0,
  fade: 0.8 2000,
  header: 'Gravity|Density',
  message: 'Listen for a moment',
  footer: 'by Jesse Allison & Anthony Marasco'
}
~~~
