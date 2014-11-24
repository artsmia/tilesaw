var http = require('http'),
    express = require('express'),
    mkdirp = require('mkdirp')

app = express()

var tileserver = process.env.TILESERVER || 'http://localhost:8888/v2/'

var home = function(path) { return process.env.HOME + '/' + path },
    imagedirectory = process.env.IMAGEDIRECTORY || home('tmp/tilesaw/data/images/'),
    tiledirectory = process.env.TILEDIR || home('Documents/MapBox/tiles/'),
    tilesaw = process.env.TILESAW || home('tmp/tilesaw/'),
    adapterOptions = {
      imagedirectory: imagedirectory,
      tiledirectory: tiledirectory,
      tilesaw: tilesaw
    },
    directories = [imagedirectory, tiledirectory, tilesaw]

directories.forEach(mkdirp.sync)

var adapters = 'noop directory mia-api'

app.get('/:image', function(req, res) {
  var image = req.params.image,
      imageName = image.replace(/\.\w+$/, '')

  if(imageName == undefined || imageName == 'favicon') {
    res.send('404')
    return
  }

  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET')

  var tileJson = tileserver+imageName+'.json'
  http.get(tileJson, function(tileRes) {
    if(tileRes.statusCode == '200') {
      tileRes.pipe(res) // pipe through the JSON from tilestream
    } else {
      var _adapters = adapters.split(' ')
      _adapters.some(function(adapter, index) {
        return require('./adapters/'+adapter)(imageName, adapterOptions, function(err, mbtiles) {
          if(err) {
            if(index+1 == _adapters.length) res.send(404, err)
            return false
          }

          http.get(tileJson, function(secondTileRes) { secondTileRes.pipe(res) })
          return true
        })
      })
    }
  })
})

var manifest = require('./manifest')
app.get('/', manifest)

http.createServer(app).listen(process.env.PORT || 8887);
console.log('tilesaw running on ' + (process.env.PORT || 8887))
console.log('.')
