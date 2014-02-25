var fs = require('fs'),
    exec = require('exec'),
    mkdirp = require('mkdirp')

var home = function(path) { return process.env.HOME + '/' + path },
    imagedirectory = process.env.IMAGEDIRECTORY || home('tmp/tilesaw/data/images/'),
    tiledirectory = process.env.TILEDIR || home('Documents/MapBox/tiles/'),
    tilesaw = process.env.TILESAW || home('tmp/tilesaw/'),
    directories = [imagedirectory, tiledirectory, tilesaw]

directories.forEach(mkdirp.sync)

module.exports = function(imageName, callback) {
  var image = imagedirectory + imageName + '.jpg',
      tiles = imagedirectory + imageName + '.mbtiles'

  if (fs.existsSync(image)) {
    var saw = exec([tilesaw+'tilesaw.sh', image], function(stderr, out, code) {
      if(code != 0) return callback('error with tilesaw: ' + stderr)

      mv = exec(['mv', tiles, tiledirectory], function(stderr, out, code) {
        callback(null, image)
        exec(['rm', image], function() {})
      })
    })
  } else {
    callback(imageName + ': no such file')
  }
}
