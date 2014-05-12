set x="cachestatus"
md build\chrome
cd chrome
"C:\Program Files (x86)\7-Zip\7z.exe" a -tzip %x%.jar * -r -mx=0 -x!*.svn
move %x%.jar ..\build\chrome
cd ..
copy *.rdf build
copy *.js build
copy chrome.manifest build
xcopy /S defaults build\defaults\
cd build
"C:\Program Files (x86)\7-Zip\7z.exe" a -tzip %x%.xpi * -r -mx=9 -x!*.svn
move %x%.xpi ..\
cd ..
rd build /s/q

"C:\Program Files (x86)\Mozilla Firefox\Firefox.exe" %x%.xpi