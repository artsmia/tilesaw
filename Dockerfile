FROM stackbrew/ubuntu:13.04
MAINTAINER Kjell Olsen <kjell@leanside.com>

RUN echo "deb http://archive.ubuntu.com/ubuntu raring main universe" > /etc/apt/sources.list
RUN apt-get update
RUN apt-get -y upgrade
run apt-get -y install dpkg-dev make build-essential git curl libssl-dev libsqlite3-0 libsqlite3-dev python

RUN curl https://raw.github.com/isaacs/nave/master/nave.sh > /bin/nave && chmod a+x /bin/nave
RUN nave usemain 0.8.24

ADD package.json /src/package.json
RUN cd /src && npm install

ADD . /src

ENV TILESAW /src
ENV LOG /var/log/tilesaw.log
ENV TILESERVER http://tiles.dx.artsmia.org/v2/
ENV TILESAW_PATH /src
ENV TILE_DIRECTORY /data/tilesaw
ENV PORT 8887
EXPOSE 8887 8888 8889
CMD ["node", "/src/index.js"]
CMD ["node", "/src/node_modules/tilestream/index.js", "start", "--host='*'", "--tilePort=8888", "--uiPort=8889", "--tiles=/data/tiles", "--subdomains=0,1,2,3"]
