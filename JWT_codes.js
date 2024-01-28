const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');

const app = express();
const PORT = 3000;

const SECRET_KEY = 'your-secret-key';
const JWT_EXPIRATION = '1h'; // Token expiration time

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files to the 'uploads' directory
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

// Sample user/login info, In future will be stored in DB.
const users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' },
];

// Sample middleware for token verification done using JWT, after user tries to make request to ou application using the given Token. Without Token no one will be allowed.
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  //verify with the secret-key and token generated, if a valid user trying to log
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });

    req.user = user;
    next();
  });
};

// Login route - generates and returns a token to Client
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // When user tries to login, Check if username & passwrod that will be fetched from database matches the one recieved from UI, if yes, then generate token with jwt, and return it to user. User then uses that Token to make requests to our Application.
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign(user, SECRET_KEY, { expiresIn: JWT_EXPIRATION });
  res.json({ token });
});

// File upload route - protected by token
app.post('/upload', verifyToken, upload.single('file'), (req, res) => {
  // Handle the uploaded file (e.g., save to database, process, etc.)
  res.json({ message: 'File uploaded successfully' });
});

// Email sending route - protected by token
app.post('/send-email', verifyToken, async (req, res) => {
  const { to, subject, text } = req.body;

  // Configure nodemailer with your email provider settings
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-email-password',
    },
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to,
    subject,
    text,
    attachments: [
      {
        filename: 'example.txt',
        path: 'uploads/example.txt', // Replace with the actual file path
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
