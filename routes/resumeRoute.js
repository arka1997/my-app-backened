import multer from 'multer';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Save files to the 'uploads' directory
    },
    filename: (req, file, cb) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  });
  
    // const upload = multer({ storage: storage });

    const resumeRoute = (req, res) => {
        // upload.single('resume');
        console.log('Resume file uploaded:', req.file);
        res.status(200).send('Resume file uploaded successfully!');
    }

    export {resumeRoute};