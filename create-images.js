
import fs from "fs";

// https://github.com/gulpjs/gulp
import gulp from "gulp";

// https://www.npmjs.com/package/gulp-image-resize
import imageResize from "gulp-image-resize";

import parallel from "concurrent-transform";

import os from "os";

const galleryData = JSON.parse(fs.readFileSync("./_data/index.json", 'utf8'));

const albums = fs.existsSync("./albums.json")
  ? JSON.parse(fs.readFileSync("./albums.json", 'utf8'))
  : galleryData.albums;

const SIZES = [
  384,
  512,
  768,
  1024,
  1536,
  2048,
  6000
];

function generateImages(size, imagePath) {
  console.log('generateImages: ' + size + ' :: ' + imagePath);

  let options = {
    upscale: false,
    width: size
  }

  gulp.src(imagePath + "/original/*.{jpg,png}")
    .pipe(parallel(
      imageResize(options),
      os.cpus().length
    ))
    .pipe(gulp.dest(imagePath + "/" + size + "-wide"))
    .on('end', generateNext);
}

let nextCursor = 0;
let nextImagePath;
function generateNext() {
  if (nextCursor < SIZES.length) {
    console.log('generateNext: ' + nextCursor + ' :: ' + SIZES[nextCursor] + ' :: ' + nextImagePath);
    generateImages(SIZES[nextCursor], nextImagePath);
    nextCursor++;
  } else {
    generateNextFolder();
  }
}

let nextFolderCursor = 0;
function generateNextFolder() {
  if (nextFolderCursor < albums.length) {
    console.log('generateNextFolder: ' + nextFolderCursor + ' :: ' + albums[nextFolderCursor]);

    nextCursor = 0;
    nextImagePath = `pictures/${ albums[nextFolderCursor] }`;
    generateNext();

    nextFolderCursor++;
  }
}

// Generate images
nextFolderCursor = 0;
generateNextFolder();

