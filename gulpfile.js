const sass = require('gulp-sass')(require('sass'));
const gulp = require('gulp');

const sassFilePath = './dev/sass/**/';


//Sass
function buildSassStyles() {
    return gulp.src([sassFilePath + '*.scss', sassFilePath + '*.sass'])
      .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
      .pipe(gulp.dest('./assets'));
};
  
exports.buildSassStyles = buildSassStyles;


exports.watch = function () {
    gulp.watch([sassFilePath + '*.scss', sassFilePath + '*.sass'], buildSassStyles);
};


exports.default = gulp.series(buildSassStyles, exports.watch);