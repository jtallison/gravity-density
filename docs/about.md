# Gravity \| Density

by Jesse Allison & Anthony Marasco

_Gravity \| Density_ is a work for cyber-hacked devices and Web Audio applications with thematic material drawn from humankind's fascination with the universe.

In _Gravity \| Density_, we begin by manipulating fixed-audio sources through the performance of hacked CD players. The sonic results of this mangled audio is sampled and then distributed to the audience’s mobile devices in both passive and interactive manners. Passive distributions allow us to create intricately-spatialized rhythmic interplay between the glitching CD players and the blanket of overlapping samples dispersed throughout the networked audience.  Active distributions allow the audience to join in our performance; by sampling small portions of the audio, processing and looping these sounds and sending them back to the performers, we string this audio together and feed it into a cyber-controlled distortion pedal before sending it back to the audience for more manipulation. This results in overlapping cycles of control and audio generation between performer, audience, network, and machine.

----


<script src= "https://player.twitch.tv/js/embed/v1.js"></script>

<div id="streamDiv"></div>

<div id="text">...</div>

<script type="text/javascript">
  let options = {
    width: 720,
    height: 480,
    channel: "allisonification",
    // video: "",
    // collection: "",
    // only needed if your site is also embedded on embed.example.com and othersite.example.com 
    parent: ["emdm.io", "gravity.emdm.io"]
  };
  let player = new Twitch.Player("streamDiv", options);
  player.addEventListener(Twitch.Player.READY, ()=>{
    player.setVolume(0.8);
    let vol = player.getVolume();
    console.log("volume = ", vol);
    let textDiv = document.getElementById('text');
    textDiv.innerHTML = `Player Volume is ${vol}`
  });

</script>


----

### Performance Video

<!-- [nexusHub](https://github.com/nexus-js/nexusHub) -->

<iframe width="560" height="315" src="https://www.youtube.com/embed/DV7H69ak18w" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

----

### Recording

[Gravity \| Density recording](/gravWAC.mp3 "recording of a live performance")

---- 

## Images

![gd-performance-far-small](/images/gd-performance-far-small.png "Gravity \| Density in performance")

Gravity \| Density in performance

![gd-sputnik-looping-small](/images/gd-sputnik-looping-small.png "Gravity \| Density mobile UI")

Gravity \| Density mobile UI


![gravHub console display](/images/gd-control-ends.png "gravHub with audience members")

gravHub with audience members - lots of audience members

----

## Project Development

<iframe width="560" height="315" src="https://www.youtube.com/embed/s-NFcPHNAzY" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Gravity \| Density in development


![gravHub development display](/images/gravHub.png "gravHub development display of audience samples")

gravHub development display of audience samples

---- 

### Video Demonstration

<!-- [Gravity\|Density Demo](GravityDensity.mp4 "Gravity\|Density Demo video") -->

Anonymized Performance Video

[https://www.youtube.com/watch?v=DV7H69ak18w](https://www.youtube.com/watch?v=DV7H69ak18w)

Anonymized Project Development Video

[https://youtu.be/s-NFcPHNAzY](https://youtu.be/s-NFcPHNAzY)

