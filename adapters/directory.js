var fs = require('fs'),
    exec = require('exec')

module.exports = function(imageName, options, callback) {
  var image = options.imagedirectory + imageName + '.jpg',
      tiles = options.imagedirectory + imageName + '.mbtiles'

  if (fs.existsSync(image)) {
    var saw = exec([options.tilesaw+'tilesaw.sh', image], function(stderr, out, code) {
      if(code != 0) return callback('error with tilesaw: ' + stderr)

      mv = exec(['mv', tiles, options.tiledirectory], function(stderr, out, code) {
        callback(null, image)
        exec(['rm', image], function() {})
      })
    })
  } else {
    callback(imageName + ': no such file')
  }
}
