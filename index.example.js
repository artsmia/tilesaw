var http = require('http'),
    express = require('express')

var tileserver = process.env.TILESERVER || 'http://localhost:8888/v2/'

app.get('/:image', function(req, res) {
  var image = req.params.image

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
      res.send(404)
    }
  })
})
