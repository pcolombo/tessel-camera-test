var resolutions = ['qqvga','qvga','vga'];
var currentResolution = 0;

var compressionRanges = [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1];
var currentCompression = 0;

var tessel = require('tessel');
var camera = require('camera-vc0706').use(tessel.port['A'], 
  { 
    resolution: resolutions[currentResolution],
    compression: compressionRanges[currentCompression]
  });

var notificationLED = tessel.led[3]; // Set up an LED to notify when we're taking a picture

var App = {};

App.onCameraReady = function() {
  // Let's get this party started
  console.log('---START---');
  console.log('--Resolution:',resolutions[currentResolution]);
  console.log('-Compression:',compressionRanges[currentCompression]);
  notificationLED.high();
  camera.takePicture(App.onCameraPicture);
};

App.onCameraError = function(err){
  console.error(err);
};

App.onCameraResolution = function(err) {
  // Reset compression and start taking pictures
  if (err)  console.error(err);
  currentCompression = 0;
  console.log('--Resolution changed to:',resolutions[currentResolution]);
  camera.setCompression(compressionRanges[currentCompression],App.onCameraCompression);
};

App.onCameraCompression = function(err){
  // Take a picture
  if (err) console.error(err);
  console.log('-Compression changed to:',compressionRanges[currentCompression]);
  camera.takePicture(App.onCameraPicture);
};

App.onCameraPicture = function(err, pic) {
  // Save file and update settings
  if (err)  console.error(err);

  var filename = resolutions[currentResolution]+'-'+String(compressionRanges[currentCompression])+'.jpg';
  notificationLED.low();
  
  console.log('Saving', filename,'...');
  process.sendfile(filename,pic); // save file to host system

  if(currentCompression < compressionRanges.length-1) {
    ++ currentCompression;
    camera.setCompression(compressionRanges[currentCompression],App.onCameraCompression);
  } else if (currentResolution < resolutions.length-1) {
    ++ currentResolution;
    camera.setResolution(resolutions[currentResolution],App.onCameraResolution);
  } else {
    camera.disable();
    console.log('---END---');
  }
  
};

camera.on('ready', App.onCameraReady);
camera.on('error', App.onCameraError);
//camera.on('compression', App.onCameraCompression);
//camera.on('resolution', App.onCameraResolution);
//camera.on('picture', App.onCameraPicture);
