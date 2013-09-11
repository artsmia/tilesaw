from joffrey/node

run apt-get update
run apt-get upgrade -y
run apt-get -y install dpkg-dev make build-essential git

run git clone https://github.com/kjell/tilesaw.git /opt/tilesaw
run cd /opt/tilesaw; npm install

env TILESAW /opt/tilesaw
env LOG /var/log/tilesaw.log
env TILESERVER http://tiles.dx.artsmia.org/v2
env TILESAW_PATH /opt/tilesaw
env TILE_DIRECTORY /data/tilesaw
env PORT 8887
expose 8887
cmd ["/usr/local/bin/node", "/opt/tilesaw/index.js"]
