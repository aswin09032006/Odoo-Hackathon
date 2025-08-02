/**
 * @file multerConfig.js
 * @description Multer configuration for handling file uploads.
 */

const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: './uploads/', // Files will be stored in the 'uploads' directory
    filename: function(req, file, cb) {
        // cb(error, filename)
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Check file type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images, PDFs, Docs Only!');
    }
}

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).array('attachments', 5); // 'attachments' is the field name, 5 is the max number of files

module.exports = upload;