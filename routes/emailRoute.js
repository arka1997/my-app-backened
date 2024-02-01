import nodemailer from 'nodemailer';
import fs from 'fs';



const emailRoute = (req, res) => {
  const { password, senderMail, excelData } = req.body; // Here we have all excel data & password
  console.log(req.body);
    const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: senderMail,
      pass: password,
    },
    connectionTimeout: 10000,
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

  if( excelData && excelData.length > 0){// Now we traverse, and go to every data set/rows, and store them
    mailParams(excelData, attachments, transporter, senderMail, req.body);
    // deleteAttachments(attachments); // Delete attachments after sending emails
  }
};
const mailParams = (excelData, attachments, transporter, senderMail, req) => {

  const { name, yoe, currentCompany, techStack } = req;
  excelData.forEach((individualEmailData) => {
  const { company_name, email_of_employees, role } = individualEmailData;

  let emailBody = `Hello, my name is ${name}. I hope this message finds you well.
                    I am writing to express my interest in the ${role} position at ${company_name}.
                    I believe my skills and experience align well with the requirements of the role.
                    Currently I am working in ${currentCompany} with ${yoe} Years of experience.
                    I have a background in ${techStack} & many more. I have attached my resume for your consideration.
                    Thank you for considering my application. I look forward to the opportunity to speak with you.`;

  let allSubjects = [name,company_name,role,yoe];
  let mailOptions = {
    from: senderMail,
    to: email_of_employees,
    subject: allSubjects.join(' || ') + ' ' + ' YOE',
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
      // fs.unlink()
      fs.unlinkSync(attachment.path); // Use fs.unlinkSync to remove files synchronously, a smail may need time to send, so the delete operation will wait, until all mails are sent, then synchronously it will delete after previous operations are done.
      console.log(`File deleted: ${attachment.filename}`);
    });
  } else {
    console.log("No files to delete.");
  }
}

export { emailRoute };