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
const watch = require('gulp-watch');
const rimraf = require('gulp-rimraf');
const pugLinter = require('gulp-pug-linter');
const path = require('path');

// DEV
const browserSync = require("browser-sync");
const reload = browserSync.reload;

const dirSync = require('gulp-directory-sync');

// PROD
const inlineCss = require('gulp-inline-css');

// UTILS
const LANG = 'en';
const pathConfig = {
  build: {
    html: 'build/',
    style: 'build/style/',
    img: 'build/i/'
  },
  src: {
    style: 'src/style/*.scss',
    pug: 'src/*.pug',
    pugTpl: '../framework/**/*.pug',
    img: 'src/i/'
  },
  db: {
    static: '../framework/data-template',
    dynamic: './src/data',
    config: './src/config'
  }
};
const servConfig = {
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

// === DEV ===
gulp.task('cleanBeforeBuild', () => {
  return gulp.src('./build/*.*', {read: false})
    .pipe(rimraf({force: true}));
});

gulp.task('style', () => {
  return gulp.src(pathConfig.src.style)
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest(pathConfig.build.style))
    .pipe(reload({stream: true}));
});

gulp.task('img:sync', function() {
  return gulp.src('')
    .pipe(plumber())
    .pipe(
      dirSync(pathConfig.src.img, pathConfig.build.img, {printSummary: true}
    ))
    .pipe(browserSync.stream());
});

gulp.task('pug', ['lint'], () => {
  return gulp.src(pathConfig.src.pug)
    .pipe(plumber())
    .pipe(gulpData(() => {
      const dataStatic = requireUncached(pathConfig.db.static)[LANG];
      const dataDynamic = requireUncached(pathConfig.db.dynamic)[LANG];
      const data = _.merge(dataStatic, dataDynamic);
      return {DATA: data};
    }))
    .pipe(gulpData(() => {
      return {CONFIG: requireUncached(pathConfig.db.config)};
    }))
    .pipe(gulpPug({pretty: true}))
    // .pipe(pugLinter())
    // .pipe(pugLinter.reporter())
    .pipe(gulp.dest(pathConfig.build.html))
    .pipe(reload({stream: true}));
});

gulp.task('watch', () => {
  watch([pathConfig.src.pug, pathConfig.src.pugTpl, pathConfig.db.dynamic, pathConfig.db.config], () => {
    // gulp.start('pug');
    gulp.start('prod');
  });
  watch([pathConfig.src.style], () => {
    gulp.start('style');
  });
  gulp.watch('./src/i/*.*', ['img:sync']);
});

// === PRODUCTION ===

gulp.task('pug:prod', ['lint'], () => {
  // get external data to pug
  const dataStatic = requireUncached(pathConfig.db.static);
  const dataDynamic = requireUncached(pathConfig.db.dynamic);
  const dataStaticQuery = _.pick(dataStatic, _.keys(dataDynamic));
  const data = _.mergeWith(dataStaticQuery, dataDynamic);
  const config = requireUncached(pathConfig.db.config);

  // get list of pug files
  const jFilesPath = path.resolve(__dirname, 'src');
  const jFiles = fs.readdirSync(jFilesPath);
  const jFilesPug = jFiles.filter(item => {
    return (/\.pug$/.test(item)) ? item : false;
  });

  // for each lang render each pug template
  _.mapKeys(data, (langItem, LANG) => {
    jFilesPug.forEach(item => {
      let base = path.basename(item, '.pug');
      let file = pug.renderFile(`${__dirname}/src/${item}`,
        _.merge({pretty: true}, {DATA: langItem}, {CONFIG: config}));
      fs.writeFileSync(`${__dirname}/src/${base}-${LANG}.html`, file);
    });
  });

  return gulp.src('./src/*.html')
    .pipe(inlineCss(
      {
        url: `file://${__dirname}/build/style.css`,
        preserveMediaQueries: true,
        applyStyleTags: false,
        removeStyleTags: false
      }))
    .pipe(gulp.dest(pathConfig.build.html));
});

gulp.task('cleanGarbage', () => {
  return gulp.src('./src/*.html', {read: false})
    .pipe(rimraf({force: true}));
});

gulp.task('webserver', () => {
  browserSync(servConfig);
});

gulp.task('lint', () => {
  return gulp
    .src(pathConfig.src.pug)
    .pipe(pugLinter())
    .pipe(pugLinter.reporter());
});

gulp.task('default', cb => {
  runSequence('img:sync', 'style', 'pug', 'webserver', 'watch');
});
gulp.task('prod', cb => {
  runSequence('cleanBeforeBuild', 'style', 'pug:prod', 'cleanGarbage', cb);
});

// TODO SEND TO LITMUS
// const litmus = require('gulp-litmus');
// var configLit = {
//   username: '',
//   password: '',
//   url: 'https://litmus.com',
//   applications: [
//     'applemail6',
//     'gmailnew',
//     'ffgmailnew',
//     'chromegmailnew',
//     'iphone4s'
//   ]
// };

// gulp.task('lit', () => {
//   return gulp.src('build/new_dep.html')
//     .pipe(litmus(configLit))
//     .pipe(gulp.dest('dist'));
// });

// TODO SEND TO FTP

// TODO PIPES
