'use strict';

var gulp              = require('gulp'),
    watch             = require('gulp-watch'),
    autoprefixer      = require('autoprefixer'),
    postcss           = require('gulp-postcss'),
    lost              = require('lost'),
    cssfmt            = require('stylefmt'),
    stylelint         = require('stylelint'),
    uglify            = require('gulp-uglify'),
    sass              = require('gulp-sass'),
    sourcemaps        = require('gulp-sourcemaps'),
    rigger            = require('gulp-rigger'),
    cssmin            = require('gulp-cssnano'),
    imagemin          = require('gulp-imagemin'),
    pug               = require('gulp-pug'),
    pngquant          = require('imagemin-pngquant'),
    rimraf            = require('rimraf'),
    browserSync       = require('browser-sync'),
    plumber           = require('gulp-plumber'),
    svgSprite         = require('gulp-svg-sprite'),
    svgmin            = require('gulp-svgmin'),
    cheerio           = require('gulp-cheerio'),
    reporter          = require('postcss-reporter'),
    scss              = require('postcss-scss'),
    reload            = browserSync.reload;

var path = {
  build: {
    html: 'build/',
    pug: 'build/',
    js: 'build/js/',
    css: 'build/css/',
    img: 'build/img/',
    pic: 'build/pic/',
    fonts: 'build/fonts/'
  },
  src: {
    html: 'src/*.html',
    pug: 'src/*.pug',
    js: 'src/js/main.js',
    style: 'src/style/main.scss',
    img: 'src/img/*.*',
    imgSvg: 'src/img/sprite-svg/*.svg',
    cssSvg: 'src/img/sprite-svg-css/*.svg',
    pic: 'src/pic/**/*.*',
    fonts: 'src/fonts/**/*.*'
  },
  watch: {
    html: 'src/**/*.html',
    pug: 'src/**/*.pug',
    js: 'src/js/**/*.js',
    style: 'src/style/**/*.scss',
    img: 'src/img/*.*',
    imgSvg: 'src/img/sprite-svg/*.svg',
    cssSvg: 'src/img/sprite-svg-css/*.svg',
    pic: 'src/pic/**/*.*',
    fonts: 'src/fonts/**/*.*'
  },
  clean: './build'
};

var config = {
  server: {
    baseDir: './build'
  },
  tunnel: false,
  host: 'localhost',
  port: 9000,
  logPrefix: 'Sedona'
};

// Basic svg-sprite configuration

var svgSpriteConfig = {
  imgSvg: {
    mode: {
      symbol: {     // Activate the «symbol» mode
        dest: '.',
        sprite: 'sprite.symbol.html'
      }
    }
  },
  cssSvg: {
    shape: {
      spacing: {
        padding: 0
      }
    },
    mode: {
      css: {
        layout: 'packed',
        sprite: 'sprite.css.svg',
        dest: './',
        bust: false,
        render : {
          scss: {
            dest: '../../src/style/utils/_svg-sprite.scss',
            template: 'src/template/sprite.css.tpl.scss'
          }
        }
      }
    },
    variables: {
      mapname: 'icons'
    }
  }
};

gulp.task('cssfmt', function() {
  gulp.src('src/style/**/*.s+(a|c)ss')
    .pipe(postcss([
      cssfmt()
    ],
    { syntax: scss }
    ))
    .pipe(gulp.dest(function(file) {
      return file.base;
    }));
});

gulp.task('stylelint', function () {
  gulp.src('src/style/**/*.s+(a|c)ss')
    .pipe(postcss([
      stylelint({
        reporters: [
          {formatter: 'string', console: true}
        ]
      }),
      reporter({ clearMessages: true })
    ],
    { syntax: scss }
    ))
});

gulp.task('webserver', function () {
  browserSync(config);
});

gulp.task('clean', function (cb) {
  rimraf(path.clean, cb);
});

gulp.task('html:build', function () {
  gulp.src(path.src.html) 
    .pipe(rigger())
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({stream: true}));
});

gulp.task('htmlPug:build', function () {
  gulp.src(path.src.pug) 
    .pipe(plumber())
    .pipe(pug({
      
    }))
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({stream: true}));
});


gulp.task('js:build', function () {
  gulp.src(path.src.js) 
    .pipe(rigger()) 
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify()) 
    .pipe(sourcemaps.write('./', {}))
    .pipe(gulp.dest(path.build.js))
    .pipe(reload({stream: true}));
});

gulp.task('style:build', function () {
  gulp.src(path.src.style) 
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(plumber())
    .pipe(sass({
      includePaths: ['src/style/'],
      outputStyle: 'compressed',
      sourceMap: true,
      errLogToConsole: true
    }))
    .pipe(postcss([
      lost(),
      autoprefixer()
    ]))
    .pipe(cssmin())
    .pipe(sourcemaps.write('./', {}))
    .pipe(gulp.dest(path.build.css))
    .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
  gulp.src(path.src.img) 
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false},{removeFill: false}],
      use: [pngquant()],
      interlaced: true
    }))
    .pipe(gulp.dest(path.build.img))
    .pipe(reload({stream: true}));
});

gulp.task('imgSvg:build', function () {
  gulp.src(path.src.imgSvg) 
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[style]').removeAttr('style');
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(svgSprite(svgSpriteConfig.imgSvg))     
    .pipe(gulp.dest('src/template/'))  // for inlining svg into DOM
    // .pipe(gulp.dest('build/img/'))        // for insertion svg using Local Srorage(doesn't work without domain)
    .pipe(reload({stream: true}));
});

gulp.task('cssSvg:build', function () {
  gulp.src(path.src.cssSvg) 
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    .pipe(svgSprite(svgSpriteConfig.cssSvg))     
    .pipe(gulp.dest(path.build.img))      
    .pipe(reload({stream: true}));
});

gulp.task('picture:build', function () {
  gulp.src(path.src.pic) 
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()],
      interlaced: true
    }))
    .pipe(gulp.dest(path.build.pic))
    .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
  gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
  'imgSvg:build',
  'cssSvg:build',
  'js:build',
  'style:build',
  'fonts:build',
  'image:build',
  'picture:build',
  'html:build',
  'htmlPug:build'
]);

gulp.task('watch', function(){
  watch([path.watch.imgSvg], function(event, cb) {
    gulp.start('imgSvg:build');
  });
  watch([path.watch.cssSvg], function(event, cb) {
    gulp.start('cssSvg:build');
  });
  watch([path.watch.style], function(event, cb) {
    gulp.start('style:build');
  });
  watch([path.watch.js], function(event, cb) {
    gulp.start('js:build');
  });
  watch([path.watch.img], function(event, cb) {
    gulp.start('image:build');
  });
  watch([path.watch.pic], function(event, cb) {
    gulp.start('picture:build');
  });
  watch([path.watch.fonts], function(event, cb) {
    gulp.start('fonts:build');
  });
  watch([path.watch.html], function(event, cb) {
    gulp.start('html:build');
  });
  watch([path.watch.pug], function(event, cb) {
    gulp.start('htmlPug:build');
  });
});


gulp.task('default', ['build', 'webserver', 'watch']);