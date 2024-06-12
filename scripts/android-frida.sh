#!/bin/bash

mkdir -p built

ARCH=${ARCH:-"x86_64"}
VERSION=${VERSION:-"16.3.3"}
BIN=./built/frida-server-${VERSION}

if [ ! -f "$BIN" ]; then

  url=https://github.com/frida/frida/releases/download/${VERSION}/frida-server-${VERSION}-android-${ARCH}.xz
  echo download frida-server from url: "$url"
  curl "$url" -L -o ./built/frida-server-"${VERSION}".xz

  unxz ./built/frida-server-"${VERSION}".xz
else
  echo frida-server-"${VERSION}" exist, skip downloading
fi

cp "$BIN" ./built/frida-server

echo

adb root

echo

adb shell "ps | grep frida-server | awk '{print \$2}' | xargs kill"
adb push ./built/frida-server /data/local/tmp/

rm ./built/frida-server

adb shell "chmod 755 /data/local/tmp/frida-server"
adb shell "nohup /data/local/tmp/frida-server > /data/local/tmp/frida-server.log 2>&1 &"

adb shell "ps | grep frida-server"
