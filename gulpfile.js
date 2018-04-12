var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var cssMin = require('gulp-css');

gulp.task('css', function () {
    gulp.src('./css/dev/*.css')
        .pipe(concat('app.css'))
        .pipe(cssMin())
        .pipe(gulp.dest('./css'));
});

gulp.task('default', ['css'], function() {
    gulp.watch('./css/dev/*.css', function() {
        gulp.run('css');
    });
});
