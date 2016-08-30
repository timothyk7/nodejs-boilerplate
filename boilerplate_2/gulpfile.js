var gulp = require('gulp');

var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');
var child_process = require('child_process');

/*** Testing ***/
// Lint Task
gulp.task('lint', function() {
    return gulp.src('app/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

/*** Optimization ***/
// Compile Sass
gulp.task('sass', function() {
    return gulp.src('app/scss/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('app/css'));
});

// Concatenate & Minify CSS
gulp.task('css', ['sass'], function() {
    return gulp.src('app/css/**/*.css')
        .pipe(concat('style.css'))
        .pipe(gulp.dest('build'))
        .pipe(rename('style.min.css'))
        .pipe(cssnano())
        .pipe(gulp.dest('public/css'));
});

// Concatenate & Minify JS
gulp.task('scripts', ['lint'], function() {
    return gulp.src('app/js/**/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('build'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/js'));
});

// JS libraries
gulp.task('libs', function() {
    return gulp.src('app/libs/**/*.js')
        .pipe(concat('libs.js'))
        .pipe(gulp.dest('build'))
        .pipe(rename('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/js'));
});

// Images 
gulp.task('images', function() {
    return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
        // Caching images that ran through imagemin
        .pipe(cache(imagemin({
            interlaced: true,
        })))
        .pipe(gulp.dest('public/images'))
});

// Fonts 
gulp.task('fonts', function() {
    return gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('public/fonts'))
});

/*** Cleaning ***/
gulp.task('clean', ['clean:build', 'clean:images', 'clean:fonts', 'clean:logs'], function(cb) {
    return cache.clearAll(cb);
});

gulp.task('clean:build', function() {
    return del.sync(['build/**/*']);
});

gulp.task('clean:images', function() {
    return del.sync(['public/images/**/*']);
});

gulp.task('clean:fonts', function() {
    return del.sync(['public/fonts/**/*']);
});

gulp.task('clean:logs', function() {
    return del.sync(['logs/**/*']);
});

/*** Client/Server starters***/
gulp.task('watch', function() {
    gulp.watch('app/views/**/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', ['scripts', browserSync.reload]);
    gulp.watch('app/scss/**/*.scss', ['css', browserSync.reload]);
    gulp.watch('app/images/**/*.+(png|jpg|jpeg|gif|svg)', ['images', browserSync.reload]);
    gulp.watch('app/fonts/**/*', ['fonts', browserSync.reload]);
});

gulp.task('browser-sync', ['nodemon'], function() {
    // for more browser-sync config options: http://www.browsersync.io/docs/options/
    browserSync.init({
        proxy: 'http://localhost:3000',
        port: 4000,
        open: false
  })
});

gulp.task('nodemon', function (cb) {
    var started = false;
    
    return nodemon({
        script: 'server.js',
        watch: ['app/routes/**/*']
    }).on('start', function () {
        if (!started) {
            cb();
        } 
        started = true; 
    }).on('restart', function onRestart() {
      setTimeout(function reload() {
            browserSync.reload();
        }, 1000);
      });
});

gulp.task('mongostart', function() {
    child_process.exec('mkdir db && mkdir logs');
    child_process.exec('mongod --dbpath db --logpath logs/mongod.log&', function(err, stdout, stderr) {
        if(err) {
            console.log(err.stack);
            console.log("Error code: " + err.code);
            console.log("Signal received: " + err.signal);
        }
        if(stderr) {
            console.log(stderr);
        }
    });
});

gulp.task('mongoend', function() {

    child_process.exec("mongo --eval 'db.shutdownServer()' admin", function(err, stdout, stderr) {
        if(err) {
            console.log(err.stack);
            console.log("Error code: " + err.code);
            console.log("Signal received: " + err.signal);
        }
    });
});

/*** Build ***/
gulp.task('default', function(cb) {
    runSequence(
        'build',
        'mongostart',
        ['browser-sync', 'watch'],
        cb
    )
});

gulp.task('build', function(cb) {
    runSequence(
        'clean:build',
        'lint',
        ['css', 'scripts', 'libs', 'images', 'fonts'],
        cb
    )
});

