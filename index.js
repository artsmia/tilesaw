var http = require('http'),
    express = require('express'),
    exec = require('exec'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    async = require('async')

app = express()

var tileserver = process.env.TILESERVER || 'http://localhost:8888/v2/',
    home = function(path) { return process.env.HOME + '/' + path },
    imagedirectory = process.env.IMAGEDIRECTORY || home('tmp/tilesaw/data/images/'),
    tiledirectory = process.env.TILEDIR || home('Documents/MapBox/tiles/'),
    tilesaw = process.env.TILESAW || home('tmp/tilesaw/'),
    directories = [imagedirectory, tiledirectory, tilesaw]

directories.forEach(mkdirp.sync)

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

var manifest = {grouped: {}, all: []}
var addToManifest = function(mbtiles, done) {
  var filename = mbtiles.replace('.mbtiles', '')
  manifest.all.push(filename)
  // and manifest[objectId]
  exec(['sqlite3', tiledirectory+mbtiles, "select * from metadata"], function(err, out, code) {
    if(err) return done(err)
    var metadata = out,
        matchObjectId = out.match(/objectId\|(.*)/),
        objectId = matchObjectId ? matchObjectId[1] : null

    manifest.grouped[objectId] || (manifest.grouped[objectId] = [])
    manifest.grouped[objectId].push(filename)
    done()
  })
}
fs.readdir(tiledirectory, function(err, files) {
  if(err) return console.error("couldn't `fs.readdir` " + tiledirectory)

  async.eachLimit(
    files.filter(function(f) { return f.match(/mbtiles$/) }),
    10,
    addToManifest,
    function(err) { console.log('manifest generated', err) }
  )
})
app.get('/', function(req, res) { res.send(manifest) })

http.createServer(app).listen(process.env.PORT || 8887);
console.log('tilesaw running on ' + (process.env.PORT || 8887))
