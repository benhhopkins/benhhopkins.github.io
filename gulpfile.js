const gulp = require('gulp');
const markdown = require('markdown-it')({
    html: true
});
const markdownattrs = require('markdown-it-attrs')
const rename = require('gulp-rename');
const fs = require('fs');
const map = require('map-stream');
const sass = require('gulp-sass');
const webserver = require('gulp-webserver');

markdown.use(markdownattrs);

gulp.task('compile', function () {
    var currentPath = '';

    var header = fs.readFileSync("pages/header.html", "utf8");
    var footer = fs.readFileSync("pages/footer.html", "utf8");

    return gulp.src('pages/*/*.md')
        .pipe(map(function (file, cb) {
            var md = file.contents.toString();
            var html = markdown.render(md);
            file.contents = Buffer.from(html);
            cb(null, file);
        }))
        .pipe(rename(function(path) {
            path.basename = "markdown";
            path.extname = ".html";
            return path;
        }))
        .pipe(gulp.dest('./pages'))
        .pipe(rename(function (path) {
            currentPath = path.dirname;
            path.basename = "index";
            console.log(currentPath);
            return path;
        }))
        .pipe(map(function (file, cb) {
            var fileContents = file.contents.toString();
            var template = fs.readFileSync("pages/template.html", "utf8");

            template = template.replace("<%article%>", fileContents);
            template = template.replace("<%header%>", header);
            template = template.replace("<%footer%>", footer);

            if (fs.existsSync("pages/" + currentPath + "/title")) {
                var pagelang = fs.readFileSync("pages/" + currentPath + "/title", "utf8");
                template = template.replace("<%title%>", pagelang);
            }
            else {
                template = template.replace("<%title%>", "Ben Hopkins Games");
            }

            if (fs.existsSync("pages/" + currentPath + "/pagelang")) {
                var pagelang = fs.readFileSync("pages/" + currentPath + "/pagelang", "utf8");
                template = template.replace("<%pagelang%>", pagelang);
            }
            else {
                template = template.replace("<%pagelang%>", "");
            }

            if (fs.existsSync("pages/" + currentPath + "/pagescripts")) {
                var pagescripts = fs.readFileSync("pages/" + currentPath + "/pagescripts", "utf8");
                template = template.replace("<%pagescripts%>", pagescripts);
            }
            else {
                template = template.replace("<%pagescripts%>", "");
            }
            
            file.contents = Buffer.from(template);
            cb(null, file);
        }))
        .pipe(gulp.dest('./pages'));
});

gulp.task('sass', function () {
    return gulp.src('css/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('css'));
});

gulp.task('default', gulp.series(['compile', 'sass'], function() { 
    gulp.watch('pages/*/*.md').on('change', gulp.series('compile'));
    gulp.watch('css/*.scss').on('change', gulp.series('sass'));

    gulp.src('./')
    .pipe(webserver({
        livereload: true,
        directoryListing: false,
        open: true
    }));
}));