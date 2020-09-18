const {series, watch, src, dest, parallel} = require('gulp');
const pump = require('pump');

// gulp plugins and utils
var livereload = require('gulp-livereload');
var postcss = require('gulp-postcss');
var zip = require('gulp-zip');
var uglify = require('gulp-uglify');
var beeper = require('beeper');

// postcss plugins
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var customProperties = require('postcss-custom-properties');

var rename = require('gulp-rename');
var concat = require('gulp-concat');
var gulpSass = require('gulp-sass');

function serve(done) {
    livereload.listen();
    done();
}

const handleError = (done) => {
    return function (err) {
        if (err) {
            beeper();
        }
        return done(err);
    };
};

function hbs(done) {
    pump([
        src(['*.hbs', '**/**/*.hbs', '!node_modules/**/*.hbs']),
        livereload()
    ], handleError(done));
}

function css(done) {
    var processors = [
        customProperties(),
        autoprefixer(),
        cssnano()
    ];

    pump([
        src('assets/css/*.css'),
        postcss(processors),
        rename('plum.min.css'),
        dest('assets/built/'),
        livereload()
    ], handleError(done));
}

function sass(done) {
    pump([
        src('assets/sass/plum.sass'),
        gulpSass(),
        dest('assets/css/'),
        livereload()
    ], handleError(done));
}

function js(done) {
    pump([
        src(['assets/js/plum.js', 'assets/js/plum-dark.js', 'assets/js/plum-img-modal.js', 'assets/js/fuse.basic.js', 'assets/js/plum-local-search.js']),
        concat('plum.min.js'),
        uglify({mangle: {toplevel: true, reserved: ['searchContentAPIKey', 'ghostAdminURL']}}),
        dest('assets/built/'),
        livereload()
    ], handleError(done));
}

function zipper(done) {
    var targetDir = 'dist/';
    var themeName = require('./package.json').name;
    var filename = themeName + '.zip';

    pump([
        src([
            '**',
            '!assets/built/*.map',
            '!node_modules', '!node_modules/**',
            '!dist', '!dist/**'
        ]),
        zip(filename),
        dest(targetDir)
    ], handleError(done));
}

const cssWatcher = () => watch('assets/css/**', css);
const hbsWatcher = () => watch(['*.hbs', '**/**/*.hbs', '!node_modules/**/*.hbs'], hbs);
const watcher = parallel(cssWatcher, hbsWatcher);
const build = series(sass, css, js);
const dev = series(build, serve, watcher);

exports.build = build;
exports.zip = series(build, zipper);
exports.default = dev;
exports.sass = series(sass);
