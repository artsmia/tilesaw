from joffrey/node

run apt-get update
run apt-get upgrade -y
run apt-get -y install dpkg-dev make build-essential git curl libssl-dev libsqlite3-0 libsqlite3-dev

run git clone https://github.com/kjell/tilesaw.git /opt/tilesaw
run cd /opt/tilesaw; npm install

env TILESAW /opt/tilesaw
env LOG /var/log/tilesaw.log
env TILESERVER http://tiles.dx.artsmia.org/v2
env TILESAW_PATH /opt/tilesaw
env TILE_DIRECTORY /data/tilesaw
env PORT 8887
expose 8887 8888 8889
cmd ["/usr/local/bin/node", "/opt/tilesaw/index.js"]
cmd ["/usr/local/bin/node", "/opt/tilesaw/node_modules/tilestream/index.js", "start", "--host='*'", "--tilePort=8888", "--uiPort=8889", "--tiles=/data/tilestream", "--subdomains=0,1,2,3"]
