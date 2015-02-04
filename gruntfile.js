module.exports = function(grunt) {
  var src = "src/",
      jsFiles = [
                "jetro.js",
                //"modules/slider/slider.std.js",
                "modules/modal/modal.std.js"
                ];

  for (var i=0, file; file = jsFiles[i]; i++) {
    jsFiles[i] = src+file;
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    dist: "dist/",

    uglify: {
      minify: {
        options: {
          sourceMap: true,
          sourceMapName: "<%= dist %>sourcemap.map"
        },
        files: {
          "<%= dist %><%= pkg.name %>.min.js": jsFiles
        }
      }
    },

    watch: {
      scripts: {
        files: jsFiles,
        tasks: ["uglify"],
        options: {
           livereload: 35729
        }
      }
    }

  });

  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("default", ["uglify", "watch"]);
};
