#!/bin/bash

# I rewrote this from the simple build.bat batch file

APP_NAME=cachestatus
mkdir --parents build/chrome
cd chrome
zip -0 -r $APP_NAME.jar * -x \*\/\*.svn\/\*
mv $APP_NAME.jar ../build/chrome
cd ..
cp *.rdf build
#cp *.js build
cp chrome.manifest build
cp -r defaults build
cd build
zip -r ../$APP_NAME.xpi * -x \*\/\*.svn\/\*
cd ..
rm -rf build
