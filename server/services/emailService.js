const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Send email verification message to new users
const sendVerificationEmail = async (user, verificationToken) => {
  // Debug logging for troubleshooting
  console.log('🔍 Email service debug:');
  console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET');
  console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
  console.log('CLIENT_URL:', process.env.CLIENT_URL);
  
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;
  
  console.log('🔗 Verification URL:', verificationUrl);
  
  const msg = {
    to: user.email,
    from: process.env.FROM_EMAIL,
    subject: 'Welcome to Red Robin Brewing Co. - Verify Your Email',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { 
              display: inline-block; 
              background: #dc2626; 
              color: white !important; 
              padding: 15px 30px; 
              text-decoration: none !important; 
              border-radius: 8px; 
              font-weight: bold; 
              margin: 20px 0; 
            }
            .button:hover { 
              background: #991b1b !important; 
              color: white !important; 
            }
            .button:visited { 
              color: white !important; 
            }
            .button:link { 
              color: white !important; 
            }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🍺 Red Robin Brewing Co.</div>
              <p>Welcome to our craft beer community!</p>
            </div>
            
            <div class="content">
              <h2>Hello ${user.firstName}!</h2>
              
              <p>Thanks for joining Red Robin Brewing Co.! Please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button" style="color: white !important; text-decoration: none !important;">Verify My Email</a>
              </div>
              
              <p>Or copy and paste this link:</p>
              <p style="word-break: break-all; color: #dc2626;">${verificationUrl}</p>
              
              <p><strong>This link expires in 24 hours.</strong></p>
            </div>
            
            <div class="footer">
              <p>Cheers! 🍻<br>Red Robin Brewing Co.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Welcome to Red Robin Brewing Co.! Please verify your email: ${verificationUrl}`
  };

  console.log('📧 Sending email to:', user.email, 'from:', process.env.FROM_EMAIL);

  try {
    const result = await sgMail.send(msg);
    console.log(`✅ Verification email sent successfully to ${user.email}`);
    console.log('SendGrid response:', result[0].statusCode);
    return true;
  } catch (error) {
    console.error('❌ SendGrid email error:', error);
    if (error.response) {
      console.error('SendGrid response body:', error.response.body);
      console.error('SendGrid response status:', error.response.status);
    }
    return false;
  }
};

// Send welcome email after successful verification
const sendWelcomeEmail = async (user) => {
  const msg = {
    to: user.email,
    from: process.env.FROM_EMAIL || 'noreply@rrbc.com.au',
    subject: 'Welcome to Red Robin Brewing Co. - Let\'s Start Exploring!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🍺 Red Robin Brewing Co.</div>
              <p>Your email is verified! Welcome aboard!</p>
            </div>
            
            <div class="content">
              <h2>Welcome ${user.firstName}!</h2>
              
              <p>🎉 Your email has been successfully verified! You're now a full member of the Red Robin Brewing Co. community.</p>
              
              <p><strong>Ready to get started? Here's what you can do:</strong></p>
              
              <div style="text-align: center;">
                <a href="${process.env.CLIENT_URL}" class="button">Explore Craft Beers</a>
              </div>
              
              <ul>
                <li>🍺 <strong>Add Your Favorite Beers:</strong> Share discoveries with the community</li>
                <li>⭐ <strong>Write Reviews:</strong> Help others find great brews</li>
                <li>🕐 <strong>Find Sessionable Beers:</strong> Perfect for long drinking sessions</li>
                <li>👥 <strong>Connect with Friends:</strong> See what others are drinking</li>
              </ul>
              
              <p>We're excited to see what amazing craft beers you'll discover and share!</p>
            </div>
            
            <div class="footer">
              <p>Cheers and happy brewing! 🍻<br>
              The Red Robin Brewing Co. Team</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Welcome email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Welcome email error:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail
};