console.log('📧 Loading email service...');

const sgMail = require('@sendgrid/mail');

console.log('📧 SendGrid imported successfully');

// Initialize SendGrid with API key
try {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('📧 SendGrid API key set:', process.env.SENDGRID_API_KEY ? 'YES' : 'NO');
} catch (error) {
  console.error('❌ Failed to set SendGrid API key:', error);
}

// Send email verification message to new users
const sendVerificationEmail = async (user, verificationToken) => {
  console.log('📧 ===== sendVerificationEmail called =====');
  console.log('📧 User email:', user.email);
  console.log('📧 User name:', user.firstName);
  console.log('📧 Token exists:', !!verificationToken);
  
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;
  
  console.log('📧 Verification URL:', verificationUrl);
  console.log('📧 FROM_EMAIL:', process.env.FROM_EMAIL);
  
  const msg = {
    to: user.email,
    from: process.env.FROM_EMAIL,
    subject: 'Welcome to Red Robin Brewing Co. - Verify Your Email',
    html: `
      <h1>Hello ${user.firstName}!</h1>
      <p>Thanks for joining Red Robin Brewing Co.!</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Verify My Email</a>
      <p>This link expires in 24 hours.</p>
    `,
    text: `Hello ${user.firstName}! Please verify your email: ${verificationUrl}`
  };

  console.log('📧 Attempting to send email...');

  try {
    const result = await sgMail.send(msg);
    console.log('✅ ===== EMAIL SENT SUCCESSFULLY =====');
    console.log('✅ Status:', result[0].statusCode);
    console.log('✅ To:', user.email);
    return true;
  } catch (error) {
    console.error('❌ ===== EMAIL SENDING FAILED =====');
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('❌ Response body:', error.response.body);
      console.error('❌ Response status:', error.response.status);
    }
    return false;
  }
};

// Send welcome email after successful verification
const sendWelcomeEmail = async (user) => {
  console.log('📧 sendWelcomeEmail called for:', user.email);
  
  const msg = {
    to: user.email,
    from: process.env.FROM_EMAIL,
    subject: 'Welcome to Red Robin Brewing Co.!',
    html: `
      <h1>Welcome ${user.firstName}!</h1>
      <p>Your email has been verified! You can now start using Red Robin Brewing Co.</p>
    `,
    text: `Welcome ${user.firstName}! Your email has been verified.`
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Welcome email sent to:', user.email);
    return true;
  } catch (error) {
    console.error('❌ Welcome email error:', error);
    return false;
  }
};

console.log('📧 Email service functions defined');

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail
};

console.log('📧 Email service exported successfully');