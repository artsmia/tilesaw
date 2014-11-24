var httpget = require('http-get'),
    exec = require('exec')

function maxDimensionForImage(id, cb) {
  rcli = require('redis').createClient()
  rcli.hget('object:'+Math.floor(id/1000), id, function(err, json) {
    var json = JSON.parse(json)
    if(json == null || json.image == 'invalid') {
      cb('invalid image')
    } else {
      cb(null, Math.max(json.image_width, json.image_height))
    } 
  })
}

module.exports = function(imageId, options, callback) {
  maxDimensionForImage(imageId, function(err, maxDimension) {
    if(err) return callback(err)

    var imageUrl = 'http://api.artsmia.org/images/'+imageId+'/'+maxDimension+'/full.jpg',
        imageFile = options.imagedirectory + imageId + '.jpg'

    httpget.get({url: imageUrl}, imageFile, function(error, result) {
      if(error || result == undefined) { return callback([error, result]) }

      var saw = exec([options.tilesaw+'/tilesaw.sh', imageFile], function(err, out, code) {
        if(code == 0) {
          mv = exec(['mv', imageFile.replace('.jpg', '.mbtiles'), options.tiledirectory], function(err, out, code) {
            mvDir = exec(['mv', 'tiles/'+imageFile.replace('.jpg', ''), options.tiledirectory], function(err, out, code) {
              exec(['rm', imageFile], function() {})
              callback(null, imageFile)
            })
          })
        } else {
          callback(['tilesaw error: ', err, out, code])
        }
      })
    })
  })
}
