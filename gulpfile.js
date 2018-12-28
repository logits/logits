var gulp = require("gulp");
var sass = require("gulp-sass");
var cleanCSS = require("gulp-clean-css");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");
var browserSync = require("browser-sync").create();
var runSequence = require("run-sequence");

var PATHS = {
  SRC_FOLDER: "./src",
  BUILD_FOLDER: "./dist",
  NODE_MODULES_FOLDER: "./node_modules",
  CSS_FOLDER: "/scss",
  JS_FOLDER: "/js",
  IMAGE_FOLDER: "/img",
  VENDOR_FOLDER: "/vendor"
};

// Copy third party libraries from /node_modules into /vendor
gulp.task("vendor", function() {
  // jQuery
  gulp
    .src([
      "./node_modules/jquery/dist/*",
      "!./node_modules/jquery/dist/core.js"
    ])
    .pipe(gulp.dest("./vendor/jquery"));
});

// Compile SCSS
gulp.task("css:compile", function() {
  return gulp
    .src(PATHS.SRC_FOLDER + PATHS.CSS_FOLDER + "/*.scss")
    .pipe(
      sass
        .sync({
          outputStyle: "expanded"
        })
        .on("error", sass.logError)
    )
    .pipe(gulp.dest(PATHS.SRC_FOLDER + PATHS.CSS_FOLDER));
});

// Minify CSS
gulp.task("css:minify", function() {
  return gulp
    .src(PATHS.SRC_FOLDER + PATHS.CSS_FOLDER + "/*.css")
    .pipe(cleanCSS())
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(gulp.dest(PATHS.BUILD_FOLDER + PATHS.CSS_FOLDER))
    .pipe(browserSync.stream());
});

// CSS
gulp.task("css", function() {
  runSequence("css:compile", "css:minify");
});

// Minify JavaScript
gulp.task("js:minify", function() {
  return gulp
    .src(PATHS.SRC_FOLDER + PATHS.JS_FOLDER + "/*.js")
    .pipe(uglify())
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(gulp.dest(PATHS.BUILD_FOLDER + PATHS.JS_FOLDER))
    .pipe(browserSync.stream());
});

// JS
gulp.task("js", function() {
  runSequence("js:minify", "vendor");
});

// Configure the browserSync task
gulp.task("browserSync", function() {
  browserSync.init({
    server: PATHS.BUILD_FOLDER + "/"
  });
});

gulp.task("copy:html", function() {
  return gulp
    .src(PATHS.SRC_FOLDER + "/*.html")
    .pipe(gulp.dest(PATHS.BUILD_FOLDER));
});

gulp.task("copy:image", function() {
  return gulp
    .src(PATHS.SRC_FOLDER + PATHS.IMAGE_FOLDER + "/*")
    .pipe(gulp.dest(PATHS.BUILD_FOLDER + PATHS.IMAGE_FOLDER));
});

// Copy
gulp.task("copy", function() {
  runSequence("copy:html", "copy:image");
});

// Dev task
gulp.task("dev", ["copy", "css", "js", "browserSync"], function() {
  gulp.watch(PATHS.SRC_FOLDER + PATHS.CSS_FOLDER + "/*.scss", ["css"]);
  gulp.watch(PATHS.SRC_FOLDER + PATHS.JS_FOLDER + "/*.js", ["js"]);
  gulp.watch(
    [
      PATHS.SRC_FOLDER + "/*.html",
      PATHS.SRC_FOLDER + PATHS.IMAGE_FOLDER + "/*"
    ],
    ["copy", browserSync.reload]
  );
});

// Build task
gulp.task("build", function() {
  runSequence("copy", "css", "js");
});
