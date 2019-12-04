# Jesse Allison (2019)
# gravity.emdm.io

#Image from Node 6.9-alpine
# FROM node:6.9-alpine  # need polyfil for Object.entries in node 6.9
# FROM gliderlabs/alpine:3.3
FROM node:8.16-alpine

# FFMPEG First
ENV FFMPEG_VERSION=4.1.4

WORKDIR /tmp/ffmpeg

RUN apk add --update build-base curl nasm tar bzip2 \
  zlib-dev openssl-dev yasm-dev lame-dev libogg-dev x264-dev libvpx-dev libvorbis-dev x265-dev freetype-dev libass-dev libwebp-dev rtmpdump-dev libtheora-dev opus-dev && \
  DIR=$(mktemp -d) && cd ${DIR} && \
  curl -s http://ffmpeg.org/releases/ffmpeg-${FFMPEG_VERSION}.tar.gz | tar zxvf - -C . && \
  cd ffmpeg-${FFMPEG_VERSION} && \
  ./configure \
  --enable-version3 --enable-gpl --enable-nonfree --enable-small --enable-libmp3lame --enable-libx264 --enable-libx265 --enable-libvpx --enable-libtheora --enable-libvorbis --enable-libopus --enable-libass --enable-libwebp --enable-librtmp --enable-postproc --enable-avresample --enable-libfreetype --enable-openssl --disable-debug && \
  make && \
  make install && \
  make distclean && \
  rm -rf ${DIR} && \
  apk del build-base curl tar bzip2 x264 openssl nasm && rm -rf /var/cache/apk/*

# Alternate: --enable-shared --cc=clang --host-cflags= --host-ldflags= --enable-gpl --enable-libaom --enable-libmp3lame --enable-libopus --enable-libsnappy --enable-libtheora --enable-libvorbis --enable-libvpx --enable-libx264 --enable-libx265 --enable-libfontconfig --enable-libfreetype --enable-frei0r --enable-libass --disable-libjack --disable-indev=jack --enable-opencl --enable-videotoolbox --disable-htmlpages

# ENTRYPOINT ["ffmpeg"]

# Now the Gravity|Density App

#Create a new directory to run our app.
RUN mkdir -p /usr/src/app

#Set the new directory as our working directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . . 

RUN ["chmod", "757", "public/uploads"]

# Our app runs on port 3000. Expose it!
# Using 3001 with Docker to be able to test it separate from running the server outside of Docker
EXPOSE 3001:3000

# to run not as the owner
RUN adduser -D allisonic
USER allisonic

# Run the application.
CMD ["npm", "start"]
