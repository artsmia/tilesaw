var http = require('http'),
    httpget = require('http-get'),
    express = require('express'),
    fs = require('fs'),
    exec = require('exec'),
    firebase = require('firebase'),
    dx = require('./dx')

app = express()

var tileserver = process.env.TILESERVER || 'http://localhost:8888/v2/'
console.log('tileserver: ' + tileserver)

app.get('/:image', function(req, res) {
  var image = req.params.image,
      imageName = image.replace(/\.\w+$/, '')

  if(imageName == undefined) return

  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET')

  tileJson = tileserver+imageName+'.json'
  console.log(' --- http.get ' + tileJson)
  http.get(tileJson, function(tile_res) {
    console.log(req.params, tile_res.statusCode)
    var progressRef = new firebase("https://tilesaw.firebaseio.com/"+imageName)
    if(tile_res.statusCode == '200') {
      tile_res.pipe(res) // pipe through the JSON from tilestream
      progressRef.set({status: 'tiled'})
    } else {
      res.send(404) // return 404 then start the tiling process [TODO: use raw websockets instead of firebase?]
      var size = dx.maxDimension(imageName)
      console.log('image size :' + size)

      if(image != undefined) {
        var imageUrl = "http://api.artsmia.org/images/1/tdx/"+size+"/"+image
        console.log(imageUrl)
        var imageFile = imageName + '.jpg'
        var tilesawPath = process.env.TILESAW_PATH || '/Users/kolsen/tmp/tilesaw',
            tilesaw = tilesawPath + '/tilesaw.sh',
            tileDirectory = process.env.TILE_DIRECTORY || '/Users/kolsen/Documents/Mapbox/tiles'

        progressRef.set({status: 'downloading original image'})
        console.log('getting image: ' + imageUrl)
        httpget.get({url: imageUrl}, imageFile, function(error, result) {
          console.log('got image')
          progressRef.set({status: 'processing image'})
          console.log(result.file)
          var saw = exec([tilesaw, imageFile], function(err, out, code) {
            console.log('tilesaw', err, out, code)
            if(code == 0) {
              mv = exec(['mv', imageName + '.mbtiles', tileDirectory], function(err, out, code) {
                exec(['rm', imageName + '.jpg'], function() {})
                progressRef.set({status: 'tiled'})
              })
            } else {
              console.log('error')
            }
          })
        })
      }
    }
  })
})

console.log('starting tilesaw on ' + (process.env.PORT || 8887))
http.createServer(app).listen(process.env.PORT || 8887);
