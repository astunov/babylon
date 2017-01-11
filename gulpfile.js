'use strict';
// COMMON
const gulp = require('gulp');
const pug = require('pug');
const gulpPug = require('gulp-pug');
const gulpData = require('gulp-data');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const fs = require('fs');
const runSequence = require('run-sequence');
const _ = require('lodash');

// DEV
const watch = require('gulp-watch');
const browserSync = require("browser-sync");
const dirSync = require('gulp-directory-sync');

// PROD
const rimraf = require('gulp-rimraf');
const inlineCss = require('gulp-inline-css');

const pugLinter = require('gulp-pug-linter');
// UTILS
const reload = browserSync.reload;
const path = {
  build: {
    html: 'build/',
    style: 'build/style/',
    img: 'build/i/'
  },
  src: {
    style: 'src/style/*.scss',
    pug: 'src/*.pug',
    pugTpl: '../framework/*.pug',
    img: 'src/i/'
  }
};
const config = {
  server: {
    baseDir: "./build"
  },
  tunnel: false,
  host: 'localhost',
  port: 9000,
  open: false,
  logPrefix: "astunov",
  reloadDelay: 300
};

function requireUncached($module) {
  delete require.cache[require.resolve($module)];
  return require($module);
}

const LANG = 'en';
const DOCTYPE = 'html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"';

// === DEV ===
gulp.task('cleanBeforeBuild', () => {
  return gulp.src('./build/*.*', {read: false})
    .pipe(rimraf({force: true}));
});

gulp.task('style', () => {
  return gulp.src(path.src.style)
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest(path.build.style))
    .pipe(reload({stream: true}));
});

gulp.task('img:sync', function() {
  return gulp.src('')
    .pipe(plumber())
    .pipe(
      dirSync(path.src.img, path.build.img, {printSummary: true}
    ))
    .pipe(browserSync.stream());
});

gulp.task('pug', ['lint'], () => {
  return gulp.src(path.src.pug)
    .pipe(plumber())
    .pipe(gulpData(() => {
      const dataStatic = requireUncached('../framework/data-template.json')[LANG];
      const dataDynamic = requireUncached('./src/data.json')[LANG];
      const data = _.merge(dataStatic, dataDynamic);
      return {data: data};
    }))
    .pipe(gulpData(() => {
      return {config: requireUncached('./src/config')};
    }))
    .pipe(gulpPug({pretty: true, DOCTYPE}))
    // .pipe(pugLinter())
    // .pipe(pugLinter.reporter())
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({stream: true}));
});

gulp.task('watch', () => {
  watch([path.src.pug, path.src.pugTpl, './src/data.json', './src/config.js'], () => {
    gulp.start('pug');
  });
  watch([path.src.style], () => {
    gulp.start('style');
  });
  gulp.watch('./src/i/*.*', ['img:sync']);
});

// === PRODUCTION ===

gulp.task('pug:prod', ['lint'], () => {
  const dataStatic = requireUncached('../framework/data-template.json');
  const dataDynamic = requireUncached('./src/data.json');
  const dataStaticQuery = _.pick(dataStatic, _.keys(dataDynamic));
  const data = _.mergeWith(dataStaticQuery, dataDynamic);

  _.mapKeys(data, (item, LANG) => {
    let file = pug.renderFile(`${__dirname}/src/index.pug`, _.merge({pretty: true, DOCTYPE}, {data: item}));
    fs.writeFileSync(`${__dirname}/src/${LANG}.html`, file);
  });

  return gulp.src('./src/*.html')
    .pipe(inlineCss(
      {
        preserveMediaQueries: true,
        applyStyleTags: false,
        removeStyleTags: false
      }))
    .pipe(gulp.dest(path.build.html));
});

gulp.task('cleanGarbage', () => {
  return gulp.src('./src/*.html', {read: false})
    .pipe(rimraf({force: true}));
});

gulp.task('webserver', () => {
  browserSync(config);
});

gulp.task('lint', () => {
  return gulp
    .src(path.src.pug)
    .pipe(pugLinter())
    .pipe(pugLinter.reporter());
});

gulp.task('default', cb => {
  runSequence('img:sync', 'style', 'pug', 'webserver', 'watch');
});
gulp.task('prod', cb => {
  runSequence('cleanBeforeBuild', 'style', 'pug:prod', 'cleanGarbage', cb);
});

