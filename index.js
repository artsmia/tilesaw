var http = require('http'),
    express = require('express'),

app = express()

var tileserver = process.env.TILESERVER || 'http://localhost:8888/v2/'

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
      require('./adapters/directory')(imageName, function(err, mbtiles) {
        if(err) return res.send(404, err)

        http.get(tileJson, function(secondTileRes) { secondTileRes.pipe(res) })
      })
    }
  })
})

http.createServer(app).listen(process.env.PORT || 8887);
console.log('tilesaw running on ' + (process.env.PORT || 8887))
