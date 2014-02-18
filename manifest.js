var exec = require('exec'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    async = require('async'),
    home = function(path) { return process.env.HOME + '/' + path },
    tiledirectory = process.env.TILEDIR || home('Documents/MapBox/tiles/')

var manifest = {objects: {}, all: []}
var addToManifest = function(mbtiles, done) {
  var filename = mbtiles.replace('.mbtiles', '')
  manifest.all.push(filename)
  exec(['sqlite3', tiledirectory+mbtiles, "select * from metadata"], function(err, out, code) {
    if(err) return done(err)
    var metadata = out,
        matchObjectId = out.match(/objectId\|(.*)/),
        objectId = matchObjectId ? matchObjectId[1] : null

    manifest.objects[objectId] || (manifest.objects[objectId] = [])
    manifest.objects[objectId].push(filename)
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

module.exports = function(req, res) { res.send(manifest) }
