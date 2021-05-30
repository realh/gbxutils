#!/bin/sh
cdir=`pwd`
cd `dirname "$0"`
dir=`pwd`
cd "$cdir"
gjs -m "${dir}/bin/tojson.js" "$@"
