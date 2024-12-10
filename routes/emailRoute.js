import nodemailer from 'nodemailer';
import fs from 'fs';



const emailRoute = async (req, res) => {
  // console.log(req.body);
  try {
    const { password, senderMail, excelData } = req.body; // Here we have all excel data & password
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10), // Ensure port is an integer
      secure: process.env.SMTP_PORT === "465", // Use secure for port 465
      auth: {
        user: senderMail,
        pass: password,
      },
      connectionTimeout: 20000, // Increase timeout for slower connections
      requireTLS: true, // Enforce TLS for port 587
    });
    
  transporter.verify(function (error, success) {
    if (error) {
      console.log('SMTP Server connection error:', error);
      return res.status(500).send("SMTP Server error: " + error.message); // Send error response
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

  if (excelData && excelData.length > 0) {
    try {
      await mailParams(excelData, attachments, transporter, senderMail, req.body);
      if (attachments) {
        await deleteAttachments(attachments);
      }
      res.status(200).send("Emails sent successfully!");
    } catch (error) {
      console.error("Error sending emails:", error);
      if (!res.headersSent) { // Prevent double response
        res.status(500).send("Error sending emails: " + error.message);
      }
    }
  } else {
    if (!res.headersSent) { // Prevent double response
      res.status(400).send("No Excel data provided");
    }
  }
  
} catch (error) {
  console.error("Unhandled error:", error);
  res.status(500).send("Internal Server Error");
}
};
const mailParams = async (excelData, attachments, transporter, senderMail, req) => {
  
  const { name, yoe, currentCompany, techStack } = req;
  const sendMailPromises = excelData.map((individualEmailData) => {
  const { company_name, email, role } = individualEmailData;
  const formattedTechStacks = techStack.join(', ');

  const emailBodyHTML = `
                    <p>Hello,</p>
                    <p>I am writing to express my interest in the <b>${role}</b> position at <b>${company_name}</b>.</p>
                    <p>Currently, I am working at <b>${currentCompany}</b> with <b>${yoe}</b> years of experience.</p>
                    <p>My expertise includes <b>${formattedTechStacks}</b> and many more. I have attached my resume for your consideration.</p>
                    <p>Thank you for your time and consideration.</p>
                    <p>Best regards,</p>
                    <p>${name}</p>
                    <p>LinkedIn Profile: <a href="https://www.linkedin.com/in/debanjan-sarkar-820676183/">Click Here</a></p>
                  `;
  let mailOptions = {
    from: senderMail,
    to: email,
    subject: `${name} || ${company_name} ||${yoe} YOE`,
    html: emailBodyHTML,
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