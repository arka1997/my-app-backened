import nodemailer from 'nodemailer';
import fs from 'fs';



const emailRoute = async (req, res) => {
  console.log(req.body);
  try {
    const { password, senderMail, excelData } = req.body; // Here we have all excel data & password
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
      const promise = mailParams(excelData, attachments, transporter, senderMail, req.body);
      promise.then(() => {
        if(attachments){
          return deleteAttachments(attachments); // Delete attachments after sending emails
        }
      })
      .then(() => {
        res.status(200).send("Emails sent successfully!");
      })
      .catch((error) => {
        console.error("Error sending emails:", error);
        res.status(500).send("Internal Server Error");
      });
  } else {
    res.status(400).send("No Excel data provided");
  }
} catch (error) {
  console.error("Unhandled error:", error);
  res.status(500).send("Internal Server Error");
}
};
const mailParams = async (excelData, attachments, transporter, senderMail, req) => {
  
  const { name, yoe, currentCompany, techStack } = req;
  const sendMailPromises = excelData.map((individualEmailData) => {
  const { company_name, email_of_employees, role } = individualEmailData;
  const formattedTechStacks = techStack.join(', ');
  
  let emailBody = `Hello, my name is ${name}. I hope this message finds you well.
                    I am writing to express my interest in the ${role} position at ${company_name}.
                    I believe my skills and experience align well with the requirements of the role.
                    Currently I am working in ${currentCompany} with ${yoe} Years of experience.
                    with profiecient experience in ${formattedTechStacks} & many more. I have attached my resume for your consideration.
                    Thank you for considering my application. I look forward to the opportunity to speak with you.`;

  let allSubjects = [name,company_name,role,yoe];
  let mailOptions = {
    from: senderMail,
    to: email_of_employees,
    subject: allSubjects.join(' || ') + ' ' + ' YOE',
    text: emailBody,
    attachments,
  };
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        console.log("Email sent successfully!");
        resolve(info);
      }
    });
  });
})
  // Wait for all emails to be sent before resolving
  await Promise.all(sendMailPromises);
};

const deleteAttachments = async (attachments) => {
  if (attachments.length > 0) {
    try {
      await Promise.all(attachments.map(async (attachment) => {
        await fs.promises.unlink(attachment.path);
        console.log(`File deleted: ${attachment.filename}`);
      }));
    } catch (error) {
      console.error("Error deleting attachments:", error);
      throw error;
    }
  } else {
    console.log("No files to delete.");
  }
};


export { emailRoute };