const nodemailer = require("nodemailer");
const Email = require("../models/Email");

let transporter = null;
let testAccount = null;

async function initTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    console.log("Creating Ethereal Test Account...");
    testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }

  return transporter;
}

const emailQueue = [];
let isProcessing = false;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const processQueue = async () => {
  if (isProcessing || emailQueue.length === 0) return;

  isProcessing = true;

  const mailTransporter = await initTransporter();

  while (emailQueue.length > 0) {

    const emailDoc = emailQueue.shift();

    try {

      console.log(`Sending email to ${emailDoc.to}`);
      console.log(`Queue remaining: ${emailQueue.length}`);

      const info = await mailTransporter.sendMail({
        from: `"AI PR Agent" <${process.env.SMTP_USER}>`,
        to: emailDoc.to,
        subject: emailDoc.subject,
        text: emailDoc.message,
        html: emailDoc.html
      });

      emailDoc.status = "sent";
      emailDoc.sentAt = new Date();
      await emailDoc.save();

      if (testAccount) {
        console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
      }

      await delay(2000);

    } catch (error) {

      console.error(`Failed to send email to ${emailDoc.to}:`, error.message);

      emailDoc.retryCount = (emailDoc.retryCount || 0) + 1;

      if (emailDoc.retryCount < 3) {
        console.log("Retrying email...");
        emailQueue.push(emailDoc);
      } else {
        emailDoc.status = "failed";
        await emailDoc.save();
      }

    }

  }

  isProcessing = false;

};

exports.enqueueEmail = (emailDoc) => {
  emailQueue.push(emailDoc);
  processQueue();
};

exports.getQueueStatus = () => {
  return {
    queueLength: emailQueue.length,
    processing: isProcessing
  };
};
