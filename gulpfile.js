let preprocessor = 'sass'; 
 
const { src, dest, parallel, series, watch } = require('gulp');
 
const browserSync = require('browser-sync').create();
 
const concat = require('gulp-concat');

const uglify = require('gulp-uglify-es').default;

const sass = require('gulp-sass')(require('sass'));
 
const autoprefixer = require('gulp-autoprefixer');
 
const cleancss = require('gulp-clean-css');
 
const imagecomp = require('compress-images');
 
const clean = require('gulp-clean');
 


function browsersync() {
	browserSync.init({
		server: { baseDir: 'app/' },
		notify: false,
		online: true 
	})
}
 
function scripts() {
	return src([
		'node_modules/jquery/dist/jquery.min.js', // Пример подключения библиотеки
		'app/js/app.js', // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
		])
	.pipe(concat('app.min.js')) // Конкатенируем в один файл
	.pipe(uglify()) // Сжимаем JavaScript
	.pipe(dest('js/')) // Выгружаем готовый файл в папку назначения
	.pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}
 
function styles() {
	return src('app/' + preprocessor + '/index.scss') //' + preprocessor + '') // Выбираем источник: "app/sass/main.sass" или "app/less/main.less"
	.pipe(eval(preprocessor)()) // Преобразуем значение переменной "preprocessor" в функцию
	.pipe(concat('index.css')) // Конкатенируем в файл app.min.js
	.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) // Создадим префиксы с помощью Autoprefixer
	.pipe(cleancss( { level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ } )) // Минифицируем стили
	.pipe(dest('css/')) // Выгрузим результат в папку "app/css/"
	.pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}
 
async function images() {
	imagecomp(
		"app/images/src/**/*", // Берём все изображения из папки источника
		"app/images/dest/", // Выгружаем оптимизированные изображения в папку назначения
		{ compress_force: false, statistic: true, autoupdate: true }, false, // Настраиваем основные параметры
		{ jpg: { engine: "mozjpeg", command: ["-quality", "75"] } }, // Сжимаем и оптимизируем изображеня
		{ png: { engine: "pngquant", command: ["--quality=75-100", "-o"] } },
		{ svg: { engine: "svgo", command: "--multipass" } },
		{ gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
		function (err, completed) { // Обновляем страницу по завершению
			if (completed === true) {
				browserSync.reload()
			}
		}
	)
}
 
function cleanimg() {
	return src('app/images/dest/', {allowEmpty: true}).pipe(clean()) // Удаляем папку "app/images/dest/"
}
 
function buildcopy() {
	return src([ // Выбираем нужные файлы
		'app/css/**/*.min.css',
		'app/js/**/*.min.js',
		'app/images/dest/**/*',
		'app/**/*.html',
		], { base: 'app' }) // Параметр "base" сохраняет структуру проекта при копировании
	.pipe(dest('dist')) // Выгружаем в папку с финальной сборкой
}
 
function cleandist() {
	return src('dist', {allowEmpty: true}).pipe(clean()) // Удаляем папку "dist/"
}
 
function startwatch() {
 
	watch(['app/**/*.js', '!app/**/*.min.js'], scripts);

	watch('app/**/' + preprocessor + '/**/*', styles);
 
	watch('app/**/*.html').on('change', browserSync.reload);
 
	watch('app/images/src/**/*', images);
 
}
 
exports.browsersync = browsersync;
 
exports.scripts = scripts;
 
exports.styles = styles;
 
exports.images = images;
 
exports.cleanimg = cleanimg;
 
exports.build = series(cleandist, styles, scripts, images, buildcopy);
 
exports.default = parallel(styles, scripts, browsersync, startwatch);
