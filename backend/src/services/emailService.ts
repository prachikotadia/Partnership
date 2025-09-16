import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@together.app',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
};

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to Together! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">Welcome to Together!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Partner Collaboration Platform</p>
        </div>
        
        <div style="padding: 40px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}! 👋</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Welcome to Together, your partner collaboration platform! We're excited to help you and your partner stay connected, organized, and engaged.
          </p>
          
          <div style="background: white; padding: 30px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #667eea; margin-top: 0;">What you can do with Together:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>📝 <strong>Shared Tasks:</strong> Create and manage tasks together</li>
              <li>📋 <strong>Collaborative Notes:</strong> Share thoughts and ideas</li>
              <li>💰 <strong>Financial Planning:</strong> Track expenses and savings goals</li>
              <li>🔥 <strong>Streak Tracking:</strong> Build healthy habits together</li>
              <li>📅 <strong>Shared Calendar:</strong> Plan events and activities</li>
              <li>🌟 <strong>Bucket List:</strong> Dream and achieve together</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CORS_ORIGIN}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold;
                      display: inline-block;">
              Get Started Now
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
            Need help? Contact us at support@together.app
          </p>
        </div>
      </div>
    `
  }),

  passwordReset: (name: string, resetUrl: string) => ({
    subject: 'Reset Your Together Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Password Reset</h1>
        </div>
        
        <div style="padding: 40px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You requested to reset your password for your Together account. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold;
                      display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This link will expire in 1 hour for security reasons.
          </p>
          
          <p style="color: #999; font-size: 14px;">
            If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
      </div>
    `
  }),

  partnerInvite: (inviterName: string, inviteeName: string, inviteUrl: string) => ({
    subject: `${inviterName} invited you to join Together! 💕`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">You're Invited! 💕</h1>
        </div>
        
        <div style="padding: 40px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${inviteeName},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            <strong>${inviterName}</strong> has invited you to join Together, a partner collaboration platform designed to help couples stay connected and organized.
          </p>
          
          <div style="background: white; padding: 30px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #667eea; margin-top: 0;">Together, you can:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>📝 Share tasks and stay organized</li>
              <li>📋 Collaborate on notes and ideas</li>
              <li>💰 Plan finances together</li>
              <li>🔥 Build healthy habits with streaks</li>
              <li>📅 Coordinate schedules and events</li>
              <li>🌟 Create and achieve bucket list goals</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold;
                      display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
            This invitation was sent by ${inviterName}. If you don't want to join, you can ignore this email.
          </p>
        </div>
      </div>
    `
  })
};
