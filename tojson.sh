#!/bin/sh
cdir=`pwd`
cd `dirname "$0"`
dir=`pwd`
cd "$cdir"
gjs -I "${dir}/js" "${dir}/js/misc/tojson.js" "$@"
