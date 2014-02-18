var http = require('http'),
    express = require('express'),
    exec = require('exec'),
    fs = require('fs')

app = express()

var tileserver = process.env.TILESERVER || 'http://localhost:8888/v2/',
    imagedirectory = process.env.IMAGEDIRECTORY || '/Users/kjell/tmp/data/images/',
    tiledirectory = process.env.TILEDIR || '/Users/kjell/Documents/MapBox/tiles/',
    tilesaw = process.env.TILESAW || '/Users/kjell/tmp/tilesaw/'

app.get('/:image', function(req, res) {
  var image = req.params.image,
      imageName = image.replace(/\.\w+$/, '')

  if(imageName == undefined || imageName == 'favicon') {
    res.send('404')
    return
  }

  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET')

  tileJson = tileserver+imageName+'.json'
  http.get(tileJson, function(tileRes) {
    if(tileRes.statusCode == '200') {
      tileRes.pipe(res) // pipe through the JSON from tilestream
    } else {
      if (fs.existsSync(imagedirectory + '/' + imageName + '.jpg')) {
        var image = imagedirectory+imageName+'.jpg'
        var saw = exec([tilesaw+'tilesaw.sh', image], function(err, out, code) {
          if(code == 0) {
            mv = exec(['mv', imagedirectory + imageName + '.mbtiles', tiledirectory], function(err, out, code) {
              http.get(tileJson, function(secondTileRes) { secondTileRes.pipe(res) })
              exec(['rm', imagedirectory + imageName + '.jpg'], function() {})
            })
          } else {
            res.send(404)
          }
        })
      } else {
        res.send(404)
      }
    }
  })
})

http.createServer(app).listen(process.env.PORT || 8887);
console.log('tilesaw running on ' + (process.env.PORT || 8887))
