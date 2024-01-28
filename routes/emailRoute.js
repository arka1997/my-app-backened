import nodemailer from 'nodemailer';
import fs from 'fs';



const emailRoute = (req, res) => {
  const { name, password, sender_mail, yoe, currentCompany, data } = req.body; // Here we have all excel data & password
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: sender_mail,
      pass: password,
    },
  });
  transporter.verify(function (error, success) {
    if (error) {
      console.log('SMTP Server connection error:', error);
    } else {
      console.log('SMTP Server connection is ready',success);
    }
  });
  // Get list of uploaded resumes
  const resumesPath = './uploads/';
  const attachments = fs.readdirSync(resumesPath).map((filename) => ({
    filename,
    path: `${resumesPath}${filename}`,
  }));

  if( data && data.length > 0){// Now we traverse, and go to every data set/rows, and store them
    mailParams(data, attachments, transporter, name, sender_mail, yoe, currentCompany);
  }
  
    // deleteAttachments(attachments);// Delete all the attachments from ./uploads folder
};
const mailParams = (data, attachments, transporter, name, sender_mail, yoe, currentCompany) => {

  data.forEach((individualEmailData) => {
  const { company_name, email_of_employees, role } = individualEmailData;

  let emailBody = `Hello, my name is ${name}. I hope this message finds you well.
                    I am writing to express my interest in the ${role} position at ${company_name}.
                    I believe my skills and experience align well with the requirements of the role.
                    Currently I am working in ${currentCompany} with ${yoe} Years of experience.
                    I have a background in Java and Spring Boot. I have attached my resume for your consideration.
                    Thank you for considering my application. I look forward to the opportunity to speak with you.`;


  let mailOptions = {
    from: sender_mail,
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
})
};

// Remove uploaded resumes after successfully sending the email
const deleteAttachments = (attachments) => {
    if (attachments.length > 0) {
        attachments.forEach((attachment) => {
          fs.unlink(attachment.path, (err) => {
            if (err) {
              console.error(`Error deleting file: ${attachment.filename}`);
            } else {
              console.log(`File deleted: ${attachment.filename}`);
            }
          });
        });
      } else {
        console.log("No files to delete.");
      }
}

export { emailRoute };
