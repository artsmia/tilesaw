tdx_json:
	echo "module.exports = JSON.parse('$$(curl -L http://api.artsmia.org/objects/tdx/json)')" > dx_json.js
