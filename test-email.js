// Test email configuration
require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'MISSING');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('\nVerifying transporter...');
    await transporter.verify();
    console.log('✓ Email configuration is valid!');

    console.log('\nSending test email...');
    const info = await transporter.sendMail({
      from: `EWARS Bangladesh <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_USER, // Send to self
      subject: 'Test Email from EWARS Bangladesh',
      text: 'This is a test email to verify the email configuration.',
    });

    console.log('✓ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('✗ Error:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.response) console.error('SMTP Response:', error.response);
  }
}

testEmail();
