// hub.js

'use strict';

/** 
	@class hub      
	nexusHub core functions - used within node code
	```js

	hub.serverPort		// port for the server to run on. default = 3000
	hub.receive() 
	```
	
*/

// Todo: create catch-all socket.on function that simply mirrors out any information received on the specified transmit channels.

class Hub {
  constructor() {
    this.channel = this.channel.bind(this);
    this.onConnection = this.onConnection.bind(this);
    this.checkIn = this.checkIn.bind(this);
    this.enableUserTimeout = this.enableUserTimeout.bind(this);
    this.isStillActive = this.isStillActive.bind(this);
    this.getListOfUsers = this.getListOfUsers.bind(this);
    this.intervalTransmit = this.intervalTransmit.bind(this);
    this.randomItem = this.randomItem.bind(this);
    this.send = this.send.bind(this);
    this.transmit = this.transmit.bind(this);
    this.discreteClientCheck = this.discreteClientCheck.bind(this);
    this.setSection = this.setSection.bind(this);
    this.sendSection = this.sendSection.bind(this);
    this.shareSection = this.shareSection.bind(this);
    this.getSection = this.getSection.bind(this);
    this.log = this.log.bind(this);
    this.init = this.init.bind(this);
    
    this.app;
    this.logEnable = true;    // 
    this.environment = 'development';   
    this.serverPort = 3000;
    this.registeredUsers = [];     // List of registeredUsers {id: socket.id, username: socket.username, color: socket.userColor, location: socket.userLocation };
    this.ioClients = []; // list of clients who have logged in.
    this.currentSection = 0; // current section.
    this.sectionTitles = ['g|d-preConcert', 'g|d-spokenOpening', 'g|d-countdown', 'g|d-launch', 'g|d-space', 'g|d-gravity', 'g|d-postConcert'];
    this.maxActiveTimeout = 15;   // Number of seconds a client can not checkin before considered gone.
    this.intervalTimers = {};   // Used for anything you want to tranmit regularly. Useful for testing
  
    // Specific clients who we only want one instance of
    this.discreteClients = {
      display: {
        id: null
      },
      controller: {
        id: null
      },
      audio: {
        id: null
      },
      max: {
        id: null
      }
    }
  
    this.display = {
      id: ""
    };
    // conrollerID,
    this.controller = {
      id: ""
    };
    // audioID
    this.audio = {
      id: ""
    };
    // maxID
    this.max = {
      id: ""
    };
  
    this.channels = {};
  
    this.io;
  }


// TODO: Look into .bind to possibly retain socket... Wouldn't that be nice.
channel(channel, channelNickname, destinations, callback) {
  if (!channelNickname) {
    channelNickname = channel;
  }
  // console.log('channel nickname: ' + channelNickname);

  // console.log("socket? ", socket.id)


  let destinationPrecedence = 4;

  if (destinations == null) {
    // No destinations, default values
    destinations = ['others'];
    destinationPrecedence = 0;
  } else {
    if (Array.isArray(destinations)) { // Server transmit definition
      // Destination defined by Server Channel Declaration
      destinations = destinations;
    } else if (destinations instanceof String || typeof destinations === 'string') { // Server transmit definition
      destinations = [destinations];
    } else { // otherwise default values
      destinationPrecedence = 0;
      destinations = ['others'];
    }
  }

  // console.log('channel destinations: ' + destinations);

  // **** if no callback, create a default callback to send with defaults.
  // FIXME: Don't use this yet.  It's not secure. Must be a better way. perhaps .bind will provide a solution for socket.on
  if (!typeof callback === "function" || typeof callback === "undefined") {
    //this.socket.on(channel, callback);
    // callback = function(data) {
    //     hub.log(`tap: ${data}`);
    //     hub.transmit(channelNickname, destinations, data);
    // }

    // console.log("Creating Callback");
    let func = "hub.log(`" + channelNickname + ": ${data}`); hub.transmit('" + channelNickname + "', [" + destinations + "], data);";
    console.log(func);
    // callback = new Function("data", func);
    // console.log("callback function? " + typeof callback);
  }
  // console.log("channel callback", callback);

  this.channels[channelNickname] = { 'channel': channel, 'destinations': destinations, 'destinationPrecedence': destinationPrecedence, 'callback': callback };

};

// onConnection – run at the end of the channel declarations, collects all channels 
//   and creates socket.on callbacks 
onConnection(sock) {
  console.log("onConnection");
  console.log("socket id: ", sock.id);
  for (var key in this.channels) {
    var channel = this.channels[key].channel;
    // console.log(channel);
    if (this.channels[key].hasOwnProperty('callback')) {
      var callback = this.channels[key].callback
        // console.log(key + " -> " + callback);
      console.log("adding callback: ", key);
      sock.on(channel, callback);
    }
  }
}

    // Check in, add to user socket if you want to handle the checkin. Also add Check in to client
    // hub.enableUserTimeout();
    // usage let activeUsers = hub.getListOfUsers();
checkIn(data) {
  // Constant contact Is the user still connected?  Update to new checkIn time
  // socket.on('checkIn', function (data) {
  timeLapse = (Date.now() - socket.userActive.getTime())/1000. ;    // Switch to registeredUsers?
  hub.log("Now: "+ Date.now() + " - last time: " + socket.userActive.getTime() + " = " + timeLapse + " Seconds");
  socket.userActive = new Date();
}
enableUserTimeout() {
    // 
  this.channel('checkIn', null, null, this.checkIn);
}
      
isStillActive (lastActive) {
  let timeLapse = (Date.now() - lastActive.getTime())/1000. ;
  hub.log(timeLapse + " Seconds");
  if(timeLapse < this.maxActiveTimeout) {
    return 1;
  } else {
    return 0;
  }
}

getListOfUsers() {
  let userArray = [];
  if(this.registeredUsers.length>0){
    let users = this.registeredUsers;
    if (users != undefined) {
      Object.users.forEach(([number, data])=>{
        let userSocket = this.ioClients[data.id];
        if(userSocket.userActive) {
          if(this.isStillActive(userSocket.userActive)) {
            console.log("active ID: " + data.id);
            userArray.push(data.id);
          }
        }
      })
    }
  }
  console.log("Current UserArray: " + userArray.length + userArray);
  // var noULDuplicates = _.uniqBy(userList, "id");
  // console.log("Current noULDuplicates: " + _.size(noULDuplicates) + noULDuplicates);
  return userArray;
}

  // Can be used for testing or whatevs
  // usage: hub.intervalTransmit('chan-or-nickname', ['display'] ,{data: 5}, interval)

intervalTransmit(channel, toWhom, data, interval) {
    console.log("Interval: ", channel, interval);
    let intervalTimer = setInterval( () => { 
      this.transmit(channel, toWhom, data);
    }, interval);
    let intervalTimerName = channel+interval;
    this.intervalTimers[intervalTimerName] = intervalTimer;
}
 

// Utilities:

randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}


// *************  Transmit functions

// others

// all

// self

// display

// controller

// audio

// max

// group

//default ['others'], Server channel, browser client channel, server transmit, browser client transmit

send(channelNickname, data) {
  // this.log('Logging a send ', channelNickname, data);
  this.transmit(channelNickname, null, data);
};

transmit(channelNickname, destinations, data) {
  // Does this channel exist?
  let channel;
  if (this.channels.hasOwnProperty(channelNickname)) {
    channel = this.channels[channelNickname].channel;
  } else {
    // nope, send the data anyway.
    channel = channelNickname;
  }

  // default ['others'] = 0, Server channel = 4, browser client channel = 3, server transmit = 2, browser client transmit = 1

  let where;

  if (destinations == null) {
    if (data.destinationPrecedence == 1 || data.destinationPrecedence == 3) {
      // Destination defined by Browser Client Declarations
      where = data.destinations;
    } else if (this.channels.hasOwnProperty(channelNickname) && this.channels[channelNickname].destinationPrecedence == 4) {
      // Destination defined by Server Channel Declaration
      where = this.channels[channelNickname].destinations;
      data.destinations = this.channels[channelNickname].destinations;
      data.destinationPrecedence = 4;
    } else {
      // No destinations, default values
      where = ['others'];
      data.destinations = ['others'];
      data.destinationPrecedence = 0;
    }
  } else {
    if (data.destinationPrecedence == 1) {
      // Destination defined by Browser Client transmit definition
      where = data.destinations;
    } else if (Array.isArray(destinations)) { // Server transmit definition
      data.destinationPrecedence = 2
      where = destinations;
    } else if (destinations instanceof String || typeof destinations === 'string') { // Server transmit definition
      data.destinationPrecedence = 2;
      where = [destinations];
    } else if (this.channels[channelNickname].destinationPrecedence == 4) { // Server Channel definition
      where = this.sends[channelNickname].destinations;
      data.destinationPrecedence = 4;
    } else { // otherwise default values
      data.destinationPrecedence = 0;
      where = ['others'];
    }
  }


  console.log("Channel: ", channel, " Destinations: ", where);


  // **** Sending the messages ****
  // where.forEach(function(destination)  // had scope issues wanting to call this.log, etc. .bind a solution?
  for (var i = 0; i < where.length; i++) {
    let destination = where[i];
    // this.log(`checking for ${destination}`);
    if (destination == "self") {
      socket.emit(channel, data);
    } else if (destination == "others") {
      // sending to all clients except sender
      // FIME: This sends to everyone! socket doesn't exist within this function. must find a way to use io to send to all but self
      this.io.emit(channel, data);
    } else if (destination == "all") {
      this.io.emit(channel, data);
    } else if (destination == "group") {
      // TODO: Implement Group functionality
    } else if (this.discreteClientCheck(destination)) {
      // Individual Discrete Clients
      this.io.to(this[destination].id).emit(channel, data);
    } else {
      this.log(`destination ${destination} does not exist`);
    }

    // other possibilities?
    // sending to all clients in 'game' room except sender
    // if (destination == "group") socket.to('game').emit(data);
    // sending to all clients in namespace 'myNamespace', including sender
    // if (destination == "namespace") io.of('myNamespace').emit(data);
    // sending to individual socketid (private message)
    // if (destination == "user") socket.to( socketid ).emit(data);
  };
};

discreteClientCheck(whom) {
  if (this.discreteClients.hasOwnProperty(whom)) {
    this.log(`discreteClientCheck for: ${whom} :: ${this.discreteClients[whom].id ? 1 : 0}`);
    return this.discreteClients[whom].id ? 1 : 0;
  } else {
    return 0;
  }
}



// **** SECTIONS ****

// to set everyone's section to the same thing
setSection(sect, destinations) {
  if (sect === 'undefined') {
    sect = this.currentSection;
  }
  if (sect >= this.sectionTitles.length) {
    sect = this.sectionTitles.length-1;
  }

  var title = this.getSection(sect);
  this.io.sockets.emit('setSection', { section: sect, title: title });

  // hub.transmit('audio')
};

// TODO: Do I still need this?
// hub.sendSection(currentSection);	 // Sets everyone's section
sendSection(sect, destinations) {
  // console.log("sendSection:", socket.id);
  if (sect === 'undefined') {
    sect = this.currentSection;
  }
  if (!destinations) {
    destinations = ['others'];
  }
  if (sect >= this.sectionTitles.length) {
    sect = this.sectionTitles.length-1;
  }
  this.currentSection = sect;

  let title = this.getSection(sect);
  // this.io.sockets.emit('setSection', { sect: sect, title: title });
  this.transmit("setSection", destinations, { sect: sect, title: title });

};

// Section shared from Max to UIs
shareSection(sect) {
  var title = this.getSection(sect);
  this.io.sockets.emit('setSection', sect, title);
};

getSection(sect) {
  var title = "none";

  if (sect !== 'undefined') {
    title = this.sectionTitles[sect];
  } else {
    title = this.sectionTitles[this.currentSection];
  }

  return title;
};

log(title='Log:', ...l) {
  if(this.logEnable) {
    console.log('Hub', title, l);
  }
};

// TODO: instantiate SocketIO here instead of node file. 
init(sio, publicFolder) {
  // Setup web app - using express to serve pages
  // var express = require('../../nexusNode/node_modules/express');
  var express = require('../node_modules/express');
  var http = require('http');
  var serverPort = this.serverPort;
  console.log("Port: " + this.serverPort);

  this.app = express();
  this.app.use(express.static(publicFolder));
  console.log(publicFolder);

  // server is the node server (web app via express)
  // this code can launch the server on port 80 and switch the user id away from sudo
  // apparently this makes it more secure - if something goes awry it isn't running under the superuser.
  var server = http.createServer(this.app)
    .listen(serverPort, function(err) {
      if (err) return cb(err);

      var uid = parseInt(process.env.SUDO_UID); // Find out which user used sudo through the environment variable
      if (uid) process.setuid(uid); // Set our server's uid to that user
      console.log('Server\'s UID is now ' + process.getuid());
    });

  // start socket.io listening on the server
  this.io = sio.listen(server);
}
  //console.log("Hub Helper Initialized!");

}



module.exports = new Hub();