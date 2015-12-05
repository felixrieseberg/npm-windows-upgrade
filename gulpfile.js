const gulp    = require('gulp'),
	  eslint  = require('gulp-eslint'),
	  exec    = require('child_process').exec;

gulp.task('test', function () {
	return gulp.src('src/*.js')
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError())
});

gulp.task('compile', function () {
	exec('babel src --out-dir lib');
});