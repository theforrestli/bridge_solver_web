var path = require('path');
var exec = require('child_process').exec;

var gulp = require('gulp');
var gutil = require('gulp-util');
var less = require('gulp-less');
var shell = require('gulp-shell');
var mustache = require('gulp-mustache');
var uncss = require('gulp-uncss');
var ext_replace=require('gulp-ext-replace');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');


var browserSync = require("browser-sync").create();
var reload=browserSync.reload;

gulp.task('shrinkwrap', shell.task('npm shrinkwrap'));

gulp.task('less', function () { return gulp.src('./less/main.less')
  .pipe(sourcemaps.init())
  .pipe(less({
    paths: [ path.join(__dirname, 'node_modules','bootstrap', 'less') ],
  }))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('css/'));
});
gulp.task('html',function(){ return gulp.src('./*.mustache')
  .pipe(mustache({
    ext: ""
  }))
  .pipe(ext_replace('.debug.html'))
  .pipe(gulp.dest("./"));
});

var jsConfigs = [
  {
    inPath: "js6/main.js",
    outDir: "js",
    outFile:"main.js",
    bundler: undefined
  },
  // {
  //   inPath: "js6/debug.js",
  //   outDir: "js",
  //   outFile:"debug.js",
  //   bundler: undefined
  // },
  // {
  //   inPath: "test/main.js",
  //   outDir: "js",
  //   outFile:"test.js",
  //   bundler: undefined
  // }
]

gulp.task('js', function(){
  function rebundle(cfg){
    cfg.bundler.bundle()
      .on('error', swallowError)
      .pipe(source(cfg.outFile))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(cfg.outDir));
  }

  jsConfigs.forEach(function(cfg){
    if(cfg.bundler == null){
      cfg.bundler = watchify(browserify(cfg.inPath, {
        debug: true,
        paths: ["js6","libs"],
      }).transform(babel, {
        compact: false,
        only: ["js6/*.js","test/*.js"]
      }));
    }
    rebundle(cfg);
  });
});
gulp.task('build',['less', 'html', 'js']);

gulp.task('html2', function(){ return gulp.src('index.mustache')
  .pipe(mustache({
    ext: ".min"
  }))
  // .pipe(html_minify())
  .pipe(ext_replace('.html'))
  .pipe(gulp.dest("./"));
});
gulp.task('less2', ['html2'], function () { return gulp.src('./css/main.css')
  .pipe(uncss({
    html: ['index.html']
  }))
  .pipe(ext_replace('.min.css'))
  .pipe(gulp.dest("./"));
});
gulp.task('build2',['less2', 'html2', 'js']);
gulp.task('serve', ['build'], function () {
  browserSync.init({
    server: {
      baseDir: "./",
      index: "index.html"
    }
  });
  // gulp.watch(['css/**/*.less'],['less',reload]);
  // gulp.watch(['index.mustache','partials/**'], ['html',reload]);
  gulp.watch(['js6/**/*.js', 'test/**/*.js'],['js', reload]);
});

function swallowError (error) {
  console.error(error.message);
  this.emit("end");
}
