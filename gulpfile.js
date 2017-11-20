const gulp = require('gulp'),
      sass = require('gulp-sass'),
      nodemon = require('gulp-nodemon'),
      browserSync = require('browser-sync'),
      bower = require('gulp-bower'),
      eslint = require('gulp-eslint'),
      mocha = require('gulp-mocha');

gulp.task('watch', () => {
  gulp.watch('app/views/**', browserSync.reload());
  gulp.watch('app/**/*.js', browserSync.reload());
  gulp.watch('public/js/**', browserSync.reload());
  gulp.watch('public/views/**', browserSync.reload());
  gulp.watch('public/css/common.scss', [ 'sass' ]);
  gulp.watch('public/css/**', browserSync.reload());
});

gulp.task('nodemon', () => {
  nodemon({
    script: 'server.js',
    ext: 'js',
    ignore: ['README.md', 'node_modules/**', '.DS_Store'],
    watch: ['app', 'config'],
    env: {
      port: 3000
    }
  });
});

gulp.task('sass', () => {
  gulp.src('public/css/common.scss')
    .pipe(sass())
      .pipe(gulp.dest('public/css/'))
});

gulp.task('lint', () => {
  gulp.src([
    'gulpfile.js',
    'public/js/**/*.js',
    'app/**/*.js',
    'test/**/*.js'
  ])
  .pipe(eslint());
});

gulp.task('bower', () => {
  bower()
    .pipe(gulp.dest('./bower_components'));
});

gulp.task('mochaTest', () => {
  gulp.src(['test/**/*.js'])
    .pipe(mocha({
      reporter: 'spec',
    }));
});

gulp.task('install', [ 'bower' ]);
gulp.task('test', [ 'mochaTest' ]);

gulp.task('default', [ 'nodemon', 'watch', 'sass' ]);