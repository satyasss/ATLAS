const Jimp = require('jimp');

Jimp.read('public/atlas-logo.png')
  .then(image => {
    // crop(x, y, w, h)
    return image.crop(30, 230, 964, 500).write('public/atlas-logo.png');
  })
  .then(() => {
    console.log('Logo cropped successfully.');
  })
  .catch(err => {
    console.error(err);
  });
