var gulp = require('gulp');
var ts = require('gulp-typescript');

gulp.task('default', ['ts', 'watch', 'nodemon']);

// Compile typescript sources
gulp.task('ts', function() {
	gulp.src(['*.ts'])
		.pipe(ts({module: 'commonjs', target: 'es2016'}))
		.js
		.pipe(gulp.dest('./build'));
});

gulp.task('watch', function() {
	gulp.watch('*.ts', ['ts']);
});


gulp.task('nodemon', ['ts', 'watch'], function() {
	nodemon({script: './build/app.js'});
});

var nodemon = require('gulp-nodemon');

