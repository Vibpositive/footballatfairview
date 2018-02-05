/* File: gulpfile.js */

// grab our gulp packages
var gulp  = require('gulp')
  , gutil = require('gulp-util')
  , coffee = require('gulp-coffee')
  , minify = require('gulp-minify')
  , nodemon = require('gulp-nodemon')
  , path = require('path')
  , concat = require('gulp-concat')
  , rename = require('gulp-rename')
  , cache = require('gulp-cached')
  , remember = require('gulp-remember')
  , plumber = require('gulp-plumber')
  , livereload = require('gulp-livereload')
  , nodemon = require("gulp-nodemon")
  , net = require("net");


// create a default task and just log a message
gulp.task('default', ['coffee', 'watch'], function(done) {
  gutil.log('Gulp is running!'),
	done();
});

gulp.task('coffee', function(done){
	gulp.src('src/coffee/**/*.coffee', { sourcemaps: true })
  .pipe(coffee({ bare: true }))
  .pipe(gulp.dest("build/"));
	done();
});



// gulp.task('watch', function() {
//   gulp.watch('src/coffee/**/*.coffee', ['coffee']);
// });

function checkServerUp(){
	setTimeout(function(){
		var sock = new net.Socket();
		sock.setTimeout(50);
		sock.on("connect", function(){
			console.log("Trigger page reload...");
			livereload.changed();
			sock.destroy();
		})
		.on("timeout", checkServerUp)
		.on("error", checkServerUp)
		.connect(3000);
	}, 70);
}

gulp.task('watch', function (done) {
	// livereload.listen();
  // Changes the browser if modifications were made to htl, css or json... FIXME
	gulp.watch(['./**/*.css', 'views/**/*.jade', 'package.json']).on('change', livereload.changed);
	// gulp.watch(['public/**/*.coffee', 'routes/**/*.coffee', 'models/**/*.coffee', "app.coffee", "util.coffee"], ['coffee']);
  gulp.watch('src/coffee/**/*.coffee', ['coffee']);
	// nodemon({script: "./bin/www", ext: "js", nodeArgs: ['/usr/bin/node-theseus']}).on("start", checkServerUp);
	// nodemon({script: "./build/app.js", ext: "js"}).on("start", checkServerUp);
  done();
});
