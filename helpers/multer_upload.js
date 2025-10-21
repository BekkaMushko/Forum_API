const multer = require('multer');
const path = require('path');
const fs = require('fs');

module.exports = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const src_dir = path.join(__dirname, '..', 'public', 'images');
      if (!fs.existsSync(src_dir)) {
        fs.mkdirSync(src_dir, { recursive: true });
      }
      cb(null, src_dir);
    },
    filename: (req, file, cb) => {
      const filename = req.user.id + '-' + file.fieldname + '-' + Date.now() + path.extname(file.originalname);
      cb(null, filename);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (!(['.apng', '.avif', '.bmp', '.gif', '.jpg', '.jpeg', '.jfif', '.pjpeg', '.pjp', '.png', '.svg', '.webp'].includes(path.extname(file.originalname).toLowerCase()))
        || !(['image/apng', 'image/avif', 'image/bmp', 'image/gif', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'].includes(file.mimetype))) {
      return cb(new Error('Unsupported image format'), false);
    } else {
      cb(null, true);
    }
  }
});

