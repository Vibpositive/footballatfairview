// Include gulp
var gulp        = require('gulp'),
gutil       = require('gulp-util'),
sass        = require('gulp-sass'),
prefix      = require('gulp-autoprefixer'),
coffee      = require('gulp-coffee'),
coffeelint  = require('gulp-coffeelint'),
concat      = require('gulp-concat'),
plumber     = require('gulp-plumber'),
changed     = require('gulp-changed'),
uglify      = require('gulp-uglify'),
notify      = require("gulp-notify");
var nodemon = require('gulp-nodemon');

var options = {
	// HTML
	HTML_SOURCE     : "views/**/*.ejs",

	// SASS / CSS
	SASS_SOURCE     : "components/sass/**/*.scss",
	SASS_DEST       : "public/css",

	// JavaScript
	COFFEE_SOURCE   : 'components/coffee/**/*.coffee',
	COFFEE_DEST     : "footballatfairview/",
	// Images
	IMAGE_SOURCE    : "components/images/**/*",
	IMAGE_DEST      : "footballatfairview/assets/images",

	// Icons
	ICONS_SOURCE    : "src/sass/app/components/icons/svg/*.svg",
	ICONS_DEST      : "build/css/fonts/"
	//TODO: Test option
};

// Compile Our Sass
gulp.task('sass', function() {
	gulp.src( options.SASS_SOURCE )
	.pipe(plumber())
	.pipe(sass())
	.on("error", notify.onError())
	.on("error", function (err) {
		console.log("Error:", err);
	})
	.pipe(prefix(
		"last 2 versions", "> 10%"
		))
	.pipe(gulp.dest( options.SASS_DEST ))
});

/*
// Compile Our Coffee
gulp.task('coffee', function () {
	gulp.src( options.COFFEE_SOURCE )
	.pipe(changed ( options.COFFEE_SOURCE ))
	.pipe(coffee({
		sourceMap: true
	})
	.on('error', gutil.log))
	.pipe(gulp.dest( options.COFFEE_DEST ))
});
*/

gulp.task('coffee', function(){
	gulp.src(options.COFFEE_SOURCE)
	.pipe(coffee({bare : true}))
	.on('error', gutil.log)
	.pipe(gulp.dest(options.COFFEE_DEST));
});

gulp.task('lint', function () {
	gulp.src( options.COFFEE_SOURCE )
	.pipe(coffeelint())
	.pipe(coffeelint.reporter())
});

gulp.task('default', function () {
	gulp.watch( options.SASS_SOURCE , ['sass']);
	gulp.watch( options.COFFEE_SOURCE , ['coffee','lint'] );
});

gulp.task('watch', function () {
	// Watch .SCSS files
	gulp.watch( options.COFFEE_SOURCE , [ 'coffee','lint'] );
	gulp.watch( options.SASS_SOURCE , ['sass']);
	// gulp.watch( options.HTML_SOURCE , ['html'] );
	// gulp.watch( options.IMAGE_SOURCE , ['images'] );

});

gulp.task('serve', function (cb) {
	nodemon({
		script  : "./footballatfairview/app.js",
		watch   : "./"
		//...add nodeArgs: ['--debug=5858'] to debug 
		//..or nodeArgs: ['--debug-brk=5858'] to debug at server start
	}).on('start', function () {
		setTimeout(function () {
			// livereload.changed();
			console.log('started!')
		}, 2000); // wait for the server to finish loading before restarting the browsers
	}).on('restart', function () {
		console.log('restarted!')
	});
});

/*gulp.task('start', function () {
  nodemon({
    script: 'server.js'
  , ext: 'js html'
  , env: { 'NODE_ENV': 'development' }
  })
})*/

gulp.task('default', ['serve', 'watch', 'coffee']);
// gulp.task('default', ['watch']);