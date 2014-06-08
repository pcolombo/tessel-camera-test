var tessel = require('tessel');
var camera = require('camera-vc0706').use(tessel.port['A'], { resolution: 'vga'});
var compressionRanges = [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1];
var compressionIndex = 0;

var notificationLED = tessel.led[3]; // Set up an LED to notify when we're taking a picture


// Wait for the camera module to say it's ready
camera.on('ready', function() {
  notificationLED.high();
  camera.setCompression(compressionRanges[compressionIndex],function(err){
    if (err) console.log("Error setting compression: ",err);
  });
});


camera.on('error', function(err) {
  console.error(err);
});

camera.on('compression', function(c) {
  console.log("Compression set to: "+c);
  camera.takePicture(function(err,image){
   if (err) {
      console.log('error taking image', err);
    } else {
      notificationLED.low();
      var name = 'vga-'+String(compressionRanges[compressionIndex])+'.jpg';
      console.log('Saving', name, '...');
      process.sendfile(name, image);
      console.log('Save successful.');
      if(compressionIndex < compressionRanges.length-1) { 
        ++compressionIndex;
        camera.setCompression(
          compressionRanges[compressionIndex],
          function(err){ if(err) console.log('Error setting compression:',err)
          });
      } else {
        console.log("All done.");
        camera.disable();
      }
    }
  });
});

camera.on('resolution', function(r) {
  console.log("Resolution set to: "+r);
});