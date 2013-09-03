var http = require('http'),
    httpget = require('http-get'),
    express = require('express'),
    fs = require('fs'),
    exec = require('exec'),
    firebase = require('firebase'),
    dx = require('./dx')
    raven = require('raven')

app = express()

raven = new raven.Client(process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN)
raven.patchGlobal()

var tileserver = process.env.TILESERVER || 'http://localhost:8888/v2/'

app.get('/:image', function(req, res) {
  var image = req.params.image,
      imageName = image.replace(/\.\w+$/, '')

  if(imageName == undefined || imageName == 'favicon') return

  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET')

  tileJson = tileserver+imageName+'.json'
  http.get(tileJson, function(tile_res) {
    client.captureMessage(req.params, tile_res.statusCode)
    var progressRef = new firebase("https://tilesaw.firebaseio.com/"+imageName)
    if(tile_res.statusCode == '200') {
      tile_res.pipe(res) // pipe through the JSON from tilestream
      progressRef.set({status: 'tiled'})
      client.captureMessage('already tiled, piping tilestream')
    } else {
      res.send(404) // return 404 then start the tiling process [TODO: use raw websockets instead of firebase?]
      var size = dx.maxDimension(imageName)
      console.log('image size :' + size)
      client.captureMessage(imageName + ' not yet tiled, commence sawing')

      if(image != undefined) {
        var imageUrl = "http://api.artsmia.org/images/1/tdx/"+size+"/"+image
        console.log(imageUrl)
        var imageFile = imageName + '.jpg'
        var tilesawPath = process.env.TILESAW_PATH || '/Users/kolsen/tmp/tilesaw',
            tilesaw = tilesawPath + '/tilesaw.sh',
            tileDirectory = process.env.TILE_DIRECTORY || '/Users/kolsen/Documents/Mapbox/tiles'

        progressRef.set({status: 'downloading original image'})
        httpget.get({url: imageUrl}, tilesawPath + '/' + imageFile, function(error, result) {
          client.captureMessage(imageName + ' downloaded')
          progressRef.set({status: 'processing image'})
          if(result == undefined) { client.captureError(error); return }
          var saw = exec([tilesaw, tilesawPath + '/' + imageFile], function(err, out, code) {
            if(code == 0) {
              mv = exec(['mv', imageName + '.mbtiles', tileDirectory], function(err, out, code) {
                exec(['rm', imageName + '.jpg'], function() {})
                progressRef.set({status: 'tiled'})
              })
            } else {
              client.captureError(error)
            }
          })
        })
      }
    }
  })
})

http.createServer(app).listen(process.env.PORT || 8887);
