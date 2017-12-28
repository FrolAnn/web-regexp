// Gulp это система управления задачами. С помощью Gulp мы будем автоматизировать задачи сборки проекта из исходных
// кодов. Сборка помогает из нескольких структурированных, хорошо закомментированных модулей кода сделать один сильно 
// сжатый модуль кода, который быстрее загружается браузером. Кроме того, мы можем разнести по разным местам исходный
// код и код, который непосредственно для показа в браузере. Система сборки сама в автоматическом режиме перенесет
// нужным нам образом код в директорию сервера, который уже будет отдавать файлы в браузер пользователя.
// Блок ниже подключает зависимости нашей сборки Gulp
const gulp = require('gulp'); // Подключаем сам Gulp
const browserSync = require('browser-sync').create(); // Модуль для автоматического обновления страницы в браузере
const concat = require('gulp-concat'); // Модуль для объединения файлов
const strip = require('gulp-strip-comments'); // Модуль для удаления комментариев
const uglify = require('gulp-uglify'); // Модуль для сжатия кода
const sourcemaps = require('gulp-sourcemaps'); // Модуль для создания карт кода
const del = require('del'); // Модуль для удаления файлов
const debug = require('gulp-debug'); // Модуль для вывода отладочной информации в консоль
const autoprefixer = require('gulp-autoprefixer'); // Модуль добавления браузерных префиксов в CSS
const server = require('./server.js'); // Наш модуль с сервером
const imagemin = require('gulp-imagemin'); // Подключаем библиотеку для работы с изображениями
const pngquant = require('imagemin-pngquant'); // Подключаем библиотеку для работы с png
const sass = require('gulp-sass'); //Подключаем Sass пакет
const babel = require('gulp-babel');
const webpack = require('webpack-stream');
const plumber = require('gulp-plumber');

// Блок с настройками для Gulp
const proxyPort = 3000, // Порт на котором будет работать прокси browser-sync (чтобы переадресовывать на сервер)
      appDir = 'app', // Директория с исходными кодами нашего проекта
      publicDir = 'public', // Директория с собранным проектом. Будет отдаваться сервером в браузер пользователя
      nocomments = 'nocomments'; // Директория для всего проекта с вырезанными комментариями

let serverPort = 3001; // Порт сервера

// gulp.task создает задачи для Gulp. Эти задачи можно вызывать через консоль, например "gulp clean", а можно из
// других задач. Задача clean будет вызываться у нас из задачи default. Задачи Gulp являются чем-то наподобие
// обычных функций, которые выполняют определенные действия для сборки проекта. Задача clean производит очистку
// директории public. У задач в отличие от функций асинхронная природа. Они не запускаются друг за другом, а
// каждая запускается независимо. Нам только остается следить за правильной последовательностью выполнения 
// этих асинхронных задач, чтобы выполнить правильную сборку проекта. Также в отличие от обычных колбэков,
// которые используются в асинхронном коде, задачи не оканчивают свою работу, пока мы явно не попросим об этом.
// Для окончания выполнения задачи необходимо: либо вызвать колбэк, который передается первым аргументом в функцию 
// задачи, либо вернуть поток (stream), либо вернуть промис (promise - специальный асинхронный объект, который
// вызывает колбэки, переданные в него, в зависимости от успешности выполнения асинхронной операции в промисе).
// При объявлении задачи необходимо указать имя задачи и функцию, которая будет запускаться при вызове задачи
gulp.task('clean', function() {
  // del возвращает промис, что приводит к завершению задачи clean
  return del([publicDir]);
});

// Задача serve запускает сервер из нашего файла server.js
gulp.task('serve', function(done) {
  // Создаем сервер, сразу его запускаем и отслеживаем событие запуска сервера:
  server.createServer(publicDir, serverPort).start().on('started', function() {
    // Как только происходит событие запуска, изменяем порт сервера в данном файле
    serverPort = this.port;
    // Запускаем колбэк, который сигнализирует об успешном выполнении задачи
    done();
  });
});

gulp.task('build-img', function() {
    return gulp.src([`${appDir}/assets/images/*.*`]) // Берем все изображения из app
        .pipe(imagemin({ // Сжимаем их с наилучшими настройками
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
		.pipe(debug({title: 'build-img'}))
        .pipe(gulp.dest(`${publicDir}/images`)); // Выгружаем на продакшен
});

// Задача запускает сборку транспайлера в один файл
gulp.task('build-js', function(done) {
  // Возвращаем поток, который сигнализирует об завершении задачи
  // В gulp.src мы указываем файлы, которые будут обрабатываться. Формат указания файлов - Glob.
  // Порядок указания файлов важен, иначе готовый файл не будет работать
  return gulp.src([`${appDir}/assets/js/script_comparison.js`,`${appDir}/assets/js/script_replacement.js`, `${appDir}/assets/js/script_main.js`])
  .pipe(plumber())
  // Далее все файлы по очереди передаются в поток через функцию pipe. debug выводит подробную информацию
  // в консоль о всех проходящих через поток файлах
  .pipe(debug({title: 'build-js'}))
  // Этот поток вырезает комментарии:
  .pipe(strip())
  // Инициализируем sourcemaps, который позволит нам проводить отладку по файлам исходникам transpiler.core.js
  // и lexer.js, хотя в браузере будет выполняться только один файл transpiler.min.js. Браузер будет автоматически
  // сопоставлять карту sourcemaps, которая добавляется комментарием в transpiler.min.js, и файлы исходники, и делать
  // удобную отладку, как будто в браузере выполняются transpiler.core.js и lexer.js, а не transpiler.min.js
  .pipe(sourcemaps.init())
  .pipe(concat('regex.min.js'))
  // прогоняем через babel
  .pipe(babel({
    presets: ['env']
  }))
  // Минимизируем transpiler.min.js. Удаляем лишние пробелы, переименовываем переменные, оптимизируем структуру:
  .pipe(uglify())
  .pipe(plumber.stop())
  // Записываем в данные карту sourcemaps:
  .pipe(sourcemaps.write())
  // Сохраняем данные в файл transpiler.min.js на диск в папку public
  .pipe(gulp.dest(`${publicDir}/js`));
});

// Задача копирования в папку public и удаления комментариев из файлов в папке app/assets
gulp.task('build-assets', function() {
  // Выбираем все файлы в папке app/assets, за исключением папки app/assets/styles. ! в пути значит "нет"
  // gulp.lastRun('build-assets') пропускает через поток только те файлы, которые изменились с последнего запуска
  // задачи 'build-assets'
  return gulp.src([`${appDir}/assets/**/*.*`, 
  `!${appDir}/assets/styles/*.*`, `!${appDir}/assets/images/*.*`, `!${appDir}/assets/fonts/*.*`], { since: gulp.lastRun('build-assets') })
  .pipe(debug({title: 'build-assets'}))
  .pipe(strip())
  .pipe(gulp.dest(publicDir));
});

gulp.task('build-fonts', function() {
  return gulp.src([`${appDir}/assets/fonts/*.*`], { since: gulp.lastRun('build-fonts') })
  .pipe(debug({title: 'build-fonts'}))
  .pipe(gulp.dest(`${publicDir}/fonts`));
});

gulp.task('build-tasks', function() {
  return gulp.src([`${appDir}/assets/tasks/*.*`], { since: gulp.lastRun('build-tasks') })
  .pipe(debug({title: 'build-tasks'}))
  .pipe(gulp.dest(`${publicDir}/tasks`));
});

// Задача копирования в папку public/styles файлов css из папки app/assets/styles
gulp.task('build-css', function() {
  return gulp.src(`${appDir}/assets/styles/main.css`, { since: gulp.lastRun('build-css') })
  .pipe(debug({title: 'build-css'}))
  // Используем модуль установки вендорных префиксов в стилях (чтобы новые свойства css работали в старых браузерах):
  .pipe(sass())
  .pipe(autoprefixer())
  .pipe(gulp.dest(`${publicDir}/styles`))
});

// Задача build группирует в себе другие задачи сборки. gulp.parallel параллельно запускает переданные в него задачи
// Т.е. когда будет запускаться задача build, будут также запускаться задачи в gulp.parallel
gulp.task('build', gulp.parallel('build-assets', 'build-css', 'build-img', 'build-fonts', 'build-tasks', 'build-js'));

// Задача инициализации сервера browser-sync, который будет работать в режиме проксирования. browser-sync
// будет каждый раз при сохранении файлов на диске автоматически обновлять страницу в браузере
gulp.task('browser-sync-init', function(done) {
  browserSync.init({
    proxy: `http://localhost:${serverPort}`,
    port: proxyPort
  });
  done();
});

// Задача watch запускает отслеживание изменений файлов на диске. gulp.series последовательно запускает 'browser-sync-init',
// а затем функцию, которая передана вторым аргументом
gulp.task('watch', gulp.series('browser-sync-init', function () {
  // gulp.watch запускает отслеживание изменений файлов в указанной директории. Как только изменение будет найдено
  // будут запущены задачи, указанные либо через gulp.series, либо gulp.parallel
  gulp.watch(`${appDir}/transpile_components/*.js`, gulp.series('build-js'));
  gulp.watch([`${appDir}/assets/**/*.*`, `!${appDir}/assets/styles/*.*`], gulp.series('build-assets'));
  gulp.watch(`${appDir}/assets/styles/*.*`, gulp.series('build-css'));
  // gulp.watch также возвращает специальный объект, на котором мы можем отслеживать события, происходящие с файлами
  // Например, ниже мы отслеживаем событие изменения файла в папке public. Как только событие 'change' произойдет,
  // запускается колбэк, первым аргументом которого будет путь к файлу. Внутри колбэка мы просто перезагружаем
  // файл в браузер с помощью browserSync. Аналогично мы можем отслеживать удаление файлов, чего gulp.watch
  // по умолчанию не делает.
  gulp.watch(`${publicDir}/**/*.*`).on('change', (path) => browserSync.reload(path));
}));

// Задача default является задачей, которая запускается по умолчанию. Задача по умолчанию запускается тогда,
// когда в терминале (консоли) мы просто запускаем команду gulp без указания какой-либо задачи.
gulp.task('default', gulp.series('clean', 'build', 'serve', 'watch'));

// Задача clean-nocomments очищает директорию nocomments, куда будет помещаться код данного проекта без комментариев
gulp.task('clean-nocomments', function() {
  // del возвращает промис, что приводит к завершению задачи
  return del([nocomments]);
});

// Задача copy-app-files копирует файлы кроме js и html из директории app в nocomments/app
gulp.task('copy-app-files', function() {
  return gulp.src([`${appDir}/**/*.*`, `!${appDir}/**/*.{js,html}`])
  .pipe(debug({title: 'copy-app-files'}))
  .pipe(gulp.dest(`${nocomments}/${appDir}`));
});

// Задача delete-app-comments берет все файлы js и html из директории app, удаляет из них комментарии и 
// помещает в директорию nocomments/app
gulp.task('delete-app-comments', function() {
  return gulp.src(`${appDir}/**/*.{js,html}`)
  .pipe(debug({title: 'delete-app-comments'}))
  .pipe(strip())
  .pipe(gulp.dest(`${nocomments}/${appDir}`));
});

// Задача delete-comments берет все js файлы из корня проекта, вырезает комментарии и помещает в nocomments
gulp.task('delete-comments', function() {
  return gulp.src('*.js')
  .pipe(debug({title: 'delete-comments'}))
  .pipe(strip())
  .pipe(gulp.dest(`${nocomments}`));
});

// Задача strip сначала очищает папку nocomments, а затем копирует туда весь проект с вырезанными комментариями.
// Возможно, кому-то будет удобнее читать код проекта без этих огромных комментариев.
gulp.task('strip', gulp.series('clean-nocomments', 
          gulp.parallel('copy-app-files', 'delete-app-comments', 'delete-comments')));