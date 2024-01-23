
// const express = require('express')// This works synchronously, It's a common JS used with old Node JS
// OR
import express from 'express' // This works asynchronously. It'sa  module JS used with ES6+
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import nodemailer from 'nodemailer';
import fs from 'fs';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(bodyParser.json());
// dotenv.config();
// Use of Express: serve when requests(GET,POST) comes and route them to Dtabase, and lsiten them, and return response.
// Here listening to a get request, and returning the response fetched to client.
// there is a callback route -> '/' OR '/getRequest/1', and in browser we select this route, and we hit this API call
// app.get('/', (req, res) => {
//     res.send(req.body);
// });
let resumeName;
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Save files to the 'uploads' directory
    },
    filename: (req, file, cb) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      resumeName = fileName;
      cb(null, fileName);
    },
  });
  
    const upload = multer({ storage: storage });

    app.post('/uploadResume', upload.single('resume'), (req, res) => {
    console.log('Resume file uploaded:', req.file);
    res.status(200).send('Resume file uploaded successfully!');
  });
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

app.post('/',(req,res) => {
  const {company_name, email_of_employees, role, name, yoe, subject} = req.body;
  let emailBody = `Hello, I hope this message finds you well.
                   I am writing to express my interest in the ${role} position at ${company_name}.
                   I believe my skills and experience align well with the requirements of the role.
                   I have a background in Java and Spring Boot. I have attached my resume for your consideration.
                   Thank you for considering my application. I look forward to the opportunity to speak with you.`;
// Get list of uploaded resumes
    const resumesPath = './uploads/';
    const attachments = fs.readdirSync(resumesPath).map((filename) => ({
    filename,
    path: `${resumesPath}${filename}`,
    }));

  let mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email_of_employees,
    subject: company_name,
    text: emailBody,
    attachments,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent successfully!");
    }
  });
  res.status(200).send('Data received successfully');
})



const port = process.env.PORT || 3001;// Either get the Environment variable in production level Server, or run the default port
// Now listening to the new port created
app.listen(port, () => {
    console.log(`Serve at http://localhost:${port}`);
})

// To reach App Passwords: https://myaccount.google.com/apppasswords?rapt=AEjHL4P_quP3elnKmD07HULUWbdKaraEanBxaXJnGiooDvzVJonoo-mL--aiq03sJfDqLEr2xV4dcQi0ROWV8EVHYe5qQ-n_NtwiUAc5d-F6gDHA5XJtz0s

// Security -> 2-step Verification -> App passwords