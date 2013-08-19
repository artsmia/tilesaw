var http = require('http'),
    httpget = require('http-get'),
    express = require('express'),
    fs = require('fs'),
    exec = require('exec'),
    firebase = require('firebase'),
    dx = require('./dx')

app = express()

app.get('/:image', function(req, res) {
  var image = req.params.image,
      imageName = image.replace(/\.\w+$/, '')

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');

  tileJson = 'http://localhost:8888/v2/'+imageName+'.json'
  http.get(tileJson, function(tile_res) {
    console.log(req.params, tile_res.statusCode)
    var progressRef = new firebase("https://tilesaw.firebaseio.com/"+imageName)
    if(tile_res.statusCode == '200') {
      tile_res.pipe(res) // pipe through the JSON from tilestream
      progressRef.set({status: 'tiled'})
    } else {
      res.send(404) // return 404 then start the tiling process
      var size = dx.maxDimension(image)

      if(image != undefined) {
        var imageUrl = "http://api.artsmia.org/images/1/tdx/"+size+"/"+image
        console.log(imageUrl)
        var imageFile = imageName + '.jpg'
        var tilesawPath = '/Users/kolsen/tmp',
            tilesaw = tilesawPath + '/tilesaw/tilesaw.sh';

        progressRef.set({status: 'downloading original image'})
        httpget.get({url: imageUrl}, imageFile, function(error, result) {
          progressRef.set({status: 'processing image'})
          console.log(result.file)
          var saw = exec([tilesaw, imageFile], function(err, out, code) {
            console.log('tilesaw', err, out, code)
            if(code == 0) {
              mv = exec(['mv', imageName + '.mbtiles', '/Users/kolsen/Documents/MapBox/tiles/'], function(err, out, code) {
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

http.createServer(app).listen(8887);
