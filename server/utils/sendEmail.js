const nodemailer = require("nodemailer");
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");
const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

  await transporter.sendMail({
    from: `"Bao Tran Mobile" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;