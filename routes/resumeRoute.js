import multer from 'multer';
import fs from 'fs';

    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
        cb(null, uploadDir); // Save files to the 'uploads' directory
        },
        filename: (req, file, cb) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
        },
    });
  
    const upload = multer({ storage: storage });

    const resumeRoute = (req, res) => {
        // Use upload.single middleware before the route to handle the file upload
        upload.single('resume')(req, res, (err) => {
            if (err) {
                console.error('Error uploading file:', err);
                return res.status(500).json({ error: 'Error uploading file' });
            }
        console.log('Resume file uploaded:', req.file);
        res.status(200).send('Resume file uploaded successfully!');
        });
    }

    export {resumeRoute};