import nodemailer from 'nodemailer';
import fs from 'fs';


  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  
  const emailRoute = (req, res) => {
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
}

export {emailRoute};