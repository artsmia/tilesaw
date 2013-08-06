var http = require('http'),
    httpget = require('http-get'),
    express = require('express'),
    fs = require('fs'),
    spawn = require('child_process').spawn;

app = express();

app.get('/:maxDimension/:image', function(req, res) {
  var image = req.params.image,
      size = req.params.maxDimension,
      imageName = image.replace(/\.\w+$/, '')

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');

  tileJson = 'http://localhost:8888/v2/'+imageName+'.json'
  http.get(tileJson, function(tile_res) {
    console.log(req.params, tile_res.statusCode)
    if(tile_res.statusCode == '200') {
      tile_res.pipe(res) // pipe through the JSON from tilestream
    } else {
      res.send(404)
      console.log('tilesaw', tile_res.statusCode)

      if(image != undefined) {
        var imageUrl = "http://api.artsmia.org/images/1/tdx/"+size+"/"+image
        console.log(imageUrl)
        var imageFile = imageName + '.jpg'
        var tilesawPath = '/Users/kolsen/tmp',
            tilesaw = tilesawPath + '/tilesaw/tilesaw.sh';

        httpget.get({url: imageUrl}, imageFile, function(error, result) {
          console.log(result.file)
          var saw = spawn(tilesaw, [imageFile])
          saw.on('close', function(code) {
            mv = spawn('mv', [imageName + '.mbtiles', '/Users/kolsen/Documents/MapBox/tiles/'])
            spawn('rm', [imageName + '.jpg'])
            mv.on('close', function(code) {
              console.log('moved')
            })
          })
        })
      }
    }
  })
})

http.createServer(app).listen(8887);
