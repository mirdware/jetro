cd ..
copy /Y /B src\std.js +modules\modal\modal.std.js src\std.min.js
cd src
java -jar yuicompressor.jar std.min.js -o std.min.js --charset utf-8