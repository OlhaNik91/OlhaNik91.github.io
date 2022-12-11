const { src, dest, parallel, series, watch } = require('gulp');
 
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass')(require('sass'));
const cleancss = require('gulp-clean-css');
const clean = require('gulp-clean');
const include = require('gulp-include')
 
const appRoot = './app';
const buildRoot = './';
const dir = {
    js: '/js',
    scss: '/scss',
    css: '/css',
	html: './'
};
const appPaths = {
	js: appRoot + dir.js + '/**/*.js',
	scss: appRoot + dir.scss + '/**/*.scss',
	html: dir.html + '/**/*.html',
};
const buildPaths = {
	js: buildRoot + dir.js,
	css: buildRoot + dir.css,
	html: buildRoot + dir.html,
};

function browsersync() {
	browserSync.init({
		server: { baseDir: appRoot },
		notify: false,
		online: true 
	})
}
 
function scripts() {
	return src([
		// 'node_modules/jquery/dist/jquery.min.js', // include libraries
		appPaths.js, // add custom scripts
		])
	.pipe(concat('index.js'))
	.pipe(uglify())
	.pipe(dest(buildPaths.js))
	.pipe(browserSync.stream()) // page update
}
 
function styles() {
	return src(appPaths.scss)
	.pipe(sass({
		outputStyle: 'compressed',
	})).on('error', sass.logError)
	.pipe(cleancss({ 
		level: { 
			1: { specialComments: 0 } 
		}
	}))
	.pipe(dest(buildPaths.css))
	.pipe(browserSync.stream())
}

function html() {
	return src('./tpl/*.html')   //(appPaths.html)
		.pipe(include())
		.on('error', console.log)
		.pipe(dest(buildPaths.html));
};
 
function buildcopy() {
	return src([ 
		buildPaths.css,
		buildPaths.js,
		], { base: appRoot })
	.pipe(dest(buildRoot))
}
 
function cleandist() {
	return src(buildRoot, {allowEmpty: true}).pipe(clean())
}
 
function startwatch() {
 
	watch([appPaths.js, '!app/js/**/*.min.js'], scripts);
	watch(appPaths.scss, styles);
 
	watch('./**/*.html').on('change', browserSync.reload);
}
 
exports.browsersync = browsersync;
exports.html = html;
exports.scripts = scripts;
exports.styles = styles;
 
exports.build = series(cleandist, html, styles, scripts, buildcopy);
exports.default = parallel(html, styles, scripts, browsersync, startwatch);
