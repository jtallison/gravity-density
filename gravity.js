// ************************************************

// NEXUS Hub Node Server
//				Jesse Allison (2018)
//
//	To Launch:
//		npm start
//		- or -
//		NODE_ENV=production sudo PORT=80 node nexusNode.js
//		(sudo is required to launch on port 80.)

// ************************************************

const multer = require('multer') //use multer to upload blob data
const bodyParser = require('body-parser');
const upload = multer(); // set multer to be the upload variable (just like express, see above ( include it, then use it/set it up))
const fs = require('fs'); //use the file system so we can save files

var sio = require('socket.io');
var publicFolder = __dirname + '/public';

var NexusHub = require('./js/hub');
var hub = new NexusHub();
let ffmpeg = require('ffmpeg');

// update any server settings before initialization
if (process.env.PORT) {
  hub.serverPort = process.env.PORT;
}

hub.init(sio, publicFolder);


hub.app.use(bodyParser.json());
hub.app.use(bodyParser.urlencoded({ extended: true }));

// *** adding in audio file upload...
hub.app.post('/upload', upload.single('soundBlob'), function(req, res, next) {
  console.log(req.file); // see what got uploaded
  let uploadLocation = __dirname + '/public/uploads/' + req.file.originalname + ".wav" // where to save the file to. make sure the incoming name has a .wav extension

  fs.writeFileSync(uploadLocation, Buffer.from(new Uint8Array(req.file.buffer))); // write the blob to the server as a file
  res.sendStatus(200); //send back that everything went ok
  console.log("Seems to have uploaded...", req.body.id, req.body.user, req.file.originalname);

  mp3(req.file.originalname);
  // Could transmit the load sample from here:
  hub.transmit('sample', null, { 'user': req.body.user, 'val': 'load', 'sample': true, 'url': req.file.originalname + '.mp3', 'id': req.body.id });
})


// Could spin off into it's own node app or spork a thread.
function mp3(fileName) {
  console.log('MP3: ', fileName);
  try {
    let process = new ffmpeg(__dirname + '/public/uploads/' + fileName + ".wav");
    // console.log('process: ', process);
    process.then(function(audio) {
      // callback mode
      audio.setAudioBitRate(128);
      // console.log('Audio', audio);
      audio.fnExtractSoundToMP3(__dirname + '/public/uploads/' + fileName + ".mp3", function(error, file) {
        if (!error) {
          console.log('Audio file: ' + file);
        } else {
          console.log('Extraction Error: ', error);
        }
      });
    }, function(err) {
      console.log('Error encoding mp3: ' + err);
    })
  } catch (e) {
    console.log('Error: ' + e.code);
    console.log(e.msg);
  }
  // console.log('done mp3');
};


// *********************
// Set Hub Variables  or add more if you like.

hub.sectionTitles = ['preConcert', 'spokenOpening', 'countdown', 'launch', 'space', 'gravity', 'postConcert'];
hub.currentSection = 0;

// global states
gravity = {
  masterFader: 1.0,
  recordEnable: false,
  editEnable: false,
  loopEnable: false,
  touchEnable: false,
  playEnable: false
}

console.log(hub.sectionTitles.length);
// *********************



// Respond to web sockets with socket.on
hub.io.sockets.on('connection', function(socket) {
  console.log("When am I called?");
  var ioClientCounter = 0; // Can I move this outside into global vars?
  this.socket = socket;
  this.socketID = socket.id;

  hub.channel('register', null, null, function(data) {
    // TODO: iterate through data and add these properties dynamically.
    // Can add any other pertinent details to the socket to be retrieved later

    socket.username = typeof data.name !== 'undefined' ? data.name : "a_user";
    socket.userColor = typeof data.color !== 'undefined' ? data.color : "#CCCCCC";
    socket.userNote = typeof data.note !== 'undefined' ? data.note : " ";
    socket.userLocation = typeof data.location !== 'undefined' ? data.location : { x: 0.5, y: 0.5 };

    // **** Standard client setup ****
    if (socket.username == "display") {
      hub.display.id = socket.id;
      hub.discreteClients.display.id = socket.id;
      console.log("Hello display: " + hub.display.id);
    }

    if (socket.username == "gravityHub") {
      hub.controller.id = socket.id;
      hub.discreteClients.controller.id = socket.id;
      console.log("Hello Controller: " + hub.controller.id);
    }

    if (socket.username == "audioController") {
      hub.audio.id = socket.id;
      hub.discreteClients.audio.id = socket.id;
      console.log("Hello Audio Controller: " + hub.audio.id);
    }

    if (socket.username == "maxController") {
      hub.audio.id = socket.id;
      hub.discreteClients.audio.id = socket.id;
      console.log("Hello MaxMSP Controller: " + hub.max.id);
    }

    if (socket.username == "a_user") {
      hub.ioClients.push(socket.id);
    }


    // hub.sendSection(hub.currentSection, ['self']);

    // hub.io.sockets.emit('setSection', {sect: sect, title: title});
    if (socket.username == "a_user") {
      // oscClient.send('/causeway/registerUser', socket.id, socket.userColor, socket.userLocation[0],socket.userLocation[1], socket.userNote);
      if (hub.audio.id) {
        hub.io.to(hub.audio.id).emit('/causeway/registerUser', { id: socket.id, color: socket.userColor, locationX: socket.userLocation[0], locationY: socket.userLocation[1], note: socket.userNote }, 1);
        // console.log("Added New User", {id: socket.id, color: socket.userColor, locationX: socket.userLocation[0], locationY: socket.userLocation[1], note: socket.userNote});
      }
    }
    
    if (hub.controller.id) {
      hub.io.to(hub.controller.id).emit('welcome', {id: socket.id, username: socket.username, color: socket.userColor, location: socket.userLocation });
    }

    socket.emit('gravityState', gravity);
    var title = hub.getSection(hub.currentSection);
    socket.emit('setSection', { section: hub.currentSection, title: title })

  });

  // Traditional socket assignments work just fine
  socket.on('disconnect', function() {
    // hub.ioClients.remove(socket.id);	// FIXME: Remove client if they leave
    hub.log('SERVER: ' + socket.id + ' has left the building');
  });

  hub.channel('sample', null, null, (data) => {
    // data.user = "name", .sample = "bang", .duration = "5000"

    console.log('sample:', data);
    hub.log(`sample ${data}`);
    hub.transmit('sample', null, data);

    if (data.val === 'load') {
      // hub.transmit('sample', null, data);
    }
  });

  hub.channel('enable', null, null, (data) => {
    // data.user = "name", .val = record, .enabled = boolean
    console.log('enable:', data);
    hub.log(`enable ${data}`);
    gravity[data.val+'Enable'] = data.enabled;
    hub.transmit('enable', null, data);
  });







  hub.channel('tap', null, ["others", "display"], function(data) {
    hub.log(`tap ${data}`);
    hub.transmit('tap', null, data);
    //  socket.broadcast.emit('tap', data);  // just for others until a fix is made.
  });

  // Don't use auto callback creation yet, it's not secure.
  // hub.channel('tap', null, ["others", "display", "audio"]);

  // TODO: Should just demo this with tap ["others"] above.
  hub.channel('tapOthers', null, ["others"], function(data) {
    hub.log(`tapOthers ${data}`);
    hub.transmit('tapOthers', null, data);
    // socket.broadcast.emit('tapOthers', data);
  });

  hub.channel('shareToggle', null, ["others"], function(data) {
    hub.log(`shareToggle ${data}`);
    hub.transmit('shareToggle', null, data);
  });

  hub.channel('masterFader', null, null, function(data) {
    // hub.transmit('masterFader', null, data);
    gravity['masterFader'] = data.val;
    socket.broadcast.emit('masterFader', data);
  });

  hub.channel('shareColor', null, ["others"], function(data) {
    hub.log(`shareColor ${data}`);
    hub.transmit('shareColor', null, data);
  });

  hub.channel('sendText', null, ["others", "display"], function(data) {
    hub.log(`sendText ${data}`);
    hub.transmit('sendText', null, data);
  });

  hub.channel('triggerPitch', null, ["others", "display"], function(data) {
    hub.log(`triggerPitch ${data}`);
    hub.transmit('triggerPitch', null, data);
  });

  hub.channel('triggerMaxPitch', null, ["max"], function(data) {
    hub.log(`triggerMaxPitch ${data}`);
    hub.transmit('triggerMaxPitch', null, data);
  });

  hub.channel('section', null, null, function(data) {
    if (data.section == 'next') {
      hub.currentSection += 1;
    } else if (data.section >= 0 && data.section < hub.sectionTitles.length) {
      hub.currentSection = data.section;
    }

    hub.setSection(hub.currentSection);
    hub.log(`Section is now: ${data.section}`)
  });

  hub.channel('item', null, null, function(data) {
    console.log(socket.id + " tapped item: " + data);
    // This could be done with the sendTypes array, but if you want to overwrite what is being sent, here you go:
    if (hub.discreteClientCheck('display')) {
      hub.io.to(hub.discreteClients['display'].id).emit('itemback', { phrase: data, color: "socket.userColor" }, 1);
    }
    if (hub.discreteClientCheck('audio')) {
      hub.io.to(hub.discreteClients[audio].id).emit('/item', { id: "socket.id", item: data }, 1);
    }
    hub.transmit('itemback', null, data);
  });



  console.log("On Connect socket id: ", socket.id);
  hub.onConnection(socket);

});