import multer from 'multer';
// Create a storage object
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Specify the directory where uploaded files will be stored
      cb(null, './Assets/Profile-pictures/');
    },
    filename: function (req, file, cb) {
      // Define the filename for the uploaded file
      const ext = file.mimetype.split('/')[1];
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  // Create the multer instance with the storage options
  const upload = multer({ storage: storage });
  export default upload;