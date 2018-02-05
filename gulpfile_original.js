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
notify      = require("gulp-notify"),
minify      = require('gulp-minify'),
nodemon     = require('gulp-nodemon'),
sourcemaps  = require('gulp-sourcemaps');

var options = {
	// HTML
	HTML_SOURCE     : "views/**/*.ejs",

	// SASS / CSS
	SASS_SOURCE     : "components/sass/**/*.scss",
	SASS_DEST       : "public/css",

	// JavaScript
	COFFEE_SOURCE   : 'components/coffee/**/*.coffee',
	COFFEE_DEST     : "footballatfairview/",
	//Public
	PUBLIC_SOURCE   : 'components/public/**/*.coffee',
	PUBLIC_DEST     : "public/js",
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

gulp.task('public', function(){
	console.log('PUBLIC')
	gulp.src(options.PUBLIC_SOURCE)
	.pipe(sourcemaps.init())
	.pipe(coffee({bare : true}))
	.on('error', gutil.log)
	.pipe(minify({ ext:{ src:'.js', min:'.min.js' } }))
	.pipe(sourcemaps.write('.'))
	.pipe(gulp.dest(options.PUBLIC_DEST));
});

gulp.task('coffee', function(){
	gulp.src(options.COFFEE_SOURCE)
	.pipe(coffee({bare : true}))
	.pipe(minify({ ext:{ src:'.js', min:'.min.js' } }))
	.on('error', gutil.log)
	.pipe(gulp.dest(options.COFFEE_DEST));
});

gulp.task('lint', function () {
	gulp.src( options.COFFEE_SOURCE )
	.pipe(coffeelint())
	.pipe(coffeelint.reporter())
});

gulp.task('watch', function(){
	gulp.watch( options.COFFEE_SOURCE , ['coffee'] );
	gulp.watch( options.PUBLIC_SOURCE , ['public'] );
	gulp.watch( options.SASS_SOURCE , ['sass']);
	gulp.watch( options.HTML_SOURCE , ['html'] );
	gulp.watch( options.IMAGE_SOURCE , ['images'] );
	gulp.task('serve');
})

gulp.task('serve', function (cb) {
	nodemon({
		script  : "./footballatfairview/app.js",
		watch   : "./"
	}).on('start', function () {
		setTimeout(function () {
			// livereload.changed();
			console.log('started!')
		}, 2000);
	}).on('restart', function () {
		console.log('restarted!')
	});
});
// gulp.task('default', ['watch', 'coffee', 'public', 'serve']);
// gulp.task('default', ['serve']);
// gulp.task('default', ['coffee', 'serve']);
// gulp.task('watch', ['serve']);
// gulp.task('default', ['serve']);
// gulp.task('default', ['watch']);
