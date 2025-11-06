const nodemailer = require("nodemailer");

async function sendOtp(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
  });

  const mailOptions = {
    from: `"Simple Auth" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Votre code OTP",
    text: `Votre code de vérification est : ${otp}`
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendOtp;
