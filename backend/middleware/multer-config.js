// MIDDLEWARE MULTER
const multer = require('multer');

// Format des images
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_'); // Suppression des espaces
    const extension = MIME_TYPES[file.mimetype]; // Récuperation de l'extension
    callback(null, name + Date.now() + '.' + extension); // Renommage du fichier avec le nouveau nom et la date
  }
});

module.exports = multer({ storage }).single('image');