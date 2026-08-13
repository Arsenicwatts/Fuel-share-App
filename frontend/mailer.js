import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

export const sendVerificationEmail = async (email, otp) => {
    // Spacer logic to stretch the numbers visually e.g., '1 2 3 4 5 6'
    const spacedOtp = otp.split('').join(' ');

    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account - FuelShare</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7faf9; font-family: 'Inter', Helvetica, Arial, sans-serif; color: #181c1c; -webkit-font-smoothing: antialiased;">
    <!-- Main Email Container -->
    <div style="max-width: 600px; margin: 40px auto; padding: 0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 12px 32px rgba(24,28,28,0.06);">
            
            <!-- Header Section -->
            <tr>
                <td style="padding: 40px 30px 20px; text-align: center;">
                    <div style="margin-bottom: 30px;">
                        <span style="font-family: 'Manrope', Arial, sans-serif; font-size: 32px; font-weight: 900; color: #005050; letter-spacing: -1px;">FuelShare</span>
                    </div>
                    <h1 style="font-family: 'Manrope', Arial, sans-serif; font-size: 28px; font-weight: 800; color: #181c1c; margin: 0 0 15px; letter-spacing: -0.5px;">Verify Your Account</h1>
                    <p style="font-size: 16px; color: #3e4948; line-height: 1.6; font-weight: 500; margin: 0;">
                        Use the code below to complete your registration.
                    </p>
                </td>
            </tr>
            
            <!-- Outline Verified Code Section -->
            <tr>
                <td style="padding: 20px 30px 40px; text-align: center;">
                    <!-- OTP Box -->
                    <div style="background-color: #f1f4f3; border-radius: 12px; padding: 30px; border: 1px solid #e0e3e2; margin-bottom: 30px;">
                        <div style="font-family: 'Manrope', Arial, sans-serif; font-size: 46px; font-weight: 900; color: #005050; letter-spacing: 8px;">
                            ${spacedOtp}
                        </div>
                    </div>
                    
                    <!-- Expiry Warning -->
                    <div style="display: inline-block; background-color: #ffdad6; border-radius: 50px; padding: 10px 20px;">
                        <span style="color: #ba1a1a; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                            This code expires in 10 minutes
                        </span>
                    </div>
                </td>
            </tr>
            
            <!-- Graphic Divider -->
            <tr><td style="height: 1px; background-color: #e6e9e8; margin: 0 30px; display: block;"></td></tr>
            
            <!-- Footer Instruction -->
            <tr>
                <td style="padding: 40px 30px; text-align: center;">
                    <p style="color: #3e4948; font-size: 14px; line-height: 1.6; margin: 0 0 30px;">
                        If you didn't request this code, you can safely ignore this email. Someone might have typed your email address by mistake.
                    </p>
                    <a href="#" style="display: inline-block; background-color: #006a6a; color: #ffffff; text-decoration: none; font-weight: 700; padding: 15px 35px; border-radius: 50px; font-family: 'Inter', Helvetica, sans-serif;">Go to Dashboard</a>
                </td>
            </tr>
            
            <!-- Branding Deep Footer -->
            <tr>
                <td style="background-color: #ebeeee; padding: 40px 30px; text-align: center;">
                    <p style="color: #3e4948; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 15px;">
                        FuelShare - Campus-Exclusive Peer-to-Peer Ride-Sharing
                    </p>
                    <p style="color: #6e7979; font-size: 10px; margin: 0 0 10px;">
                        &copy; 2026 FuelShare Technologies Inc.
                    </p>
                    <div style="font-size: 10px;">
                        <a href="#" style="color: #6e7979; text-decoration: underline; margin-right: 15px;">Privacy Policy</a>
                        <a href="#" style="color: #6e7979; text-decoration: underline;">Terms of Service</a>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>`;

    // Final Transmission
    return await transporter.sendMail({
        from: '"FuelShare Security" <axionxinex@gmail.com>',
        to: email,
        subject: "Verify Your Link - FuelShare Network",
        html: htmlTemplate
    });
};

export const sendPasswordResetEmail = async (email, otp) => {
    // Spacer logic to stretch the numbers visually e.g., '1 2 3 4 5 6'
    const spacedOtp = otp.split('').join(' ');

    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - FuelShare</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7faf9; font-family: 'Inter', Helvetica, Arial, sans-serif; color: #181c1c; -webkit-font-smoothing: antialiased;">
    <!-- Main Email Container -->
    <div style="max-width: 600px; margin: 40px auto; padding: 0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 12px 32px rgba(24,28,28,0.06);">
            
            <!-- Header Section -->
            <tr>
                <td style="padding: 40px 30px 20px; text-align: center;">
                    <div style="margin-bottom: 30px;">
                        <span style="font-family: 'Manrope', Arial, sans-serif; font-size: 32px; font-weight: 900; color: #005050; letter-spacing: -1px;">FuelShare</span>
                    </div>
                    <h1 style="font-family: 'Manrope', Arial, sans-serif; font-size: 28px; font-weight: 800; color: #181c1c; margin: 0 0 15px; letter-spacing: -0.5px;">Reset Your Password</h1>
                    <p style="font-size: 16px; color: #3e4948; line-height: 1.6; font-weight: 500; margin: 0;">
                        Use the code below to securely reset your password.
                    </p>
                </td>
            </tr>
            
            <!-- Outline Verified Code Section -->
            <tr>
                <td style="padding: 20px 30px 40px; text-align: center;">
                    <!-- OTP Box -->
                    <div style="background-color: #f1f4f3; border-radius: 12px; padding: 30px; border: 1px solid #e0e3e2; margin-bottom: 30px;">
                        <div style="font-family: 'Manrope', Arial, sans-serif; font-size: 46px; font-weight: 900; color: #005050; letter-spacing: 8px;">
                            ${spacedOtp}
                        </div>
                    </div>
                    
                    <!-- Expiry Warning -->
                    <div style="display: inline-block; background-color: #ffdad6; border-radius: 50px; padding: 10px 20px;">
                        <span style="color: #ba1a1a; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                            This code expires in 10 minutes
                        </span>
                    </div>
                </td>
            </tr>
            
            <!-- Graphic Divider -->
            <tr><td style="height: 1px; background-color: #e6e9e8; margin: 0 30px; display: block;"></td></tr>
            
            <!-- Footer Instruction -->
            <tr>
                <td style="padding: 40px 30px; text-align: center;">
                    <p style="color: #3e4948; font-size: 14px; line-height: 1.6; margin: 0 0 30px;">
                        If you didn't request a password reset, you can safely ignore this email. Your account is still secure.
                    </p>
                </td>
            </tr>
            
            <!-- Branding Deep Footer -->
            <tr>
                <td style="background-color: #ebeeee; padding: 40px 30px; text-align: center;">
                    <p style="color: #3e4948; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 15px;">
                        FuelShare - Campus-Exclusive Peer-to-Peer Ride-Sharing
                    </p>
                    <p style="color: #6e7979; font-size: 10px; margin: 0 0 10px;">
                        &copy; 2026 FuelShare Technologies Inc.
                    </p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>`;

    // Final Transmission
    return await transporter.sendMail({
        from: '"FuelShare Security" <axionxinex@gmail.com>',
        to: email,
        subject: "Password Reset - FuelShare Network",
        html: htmlTemplate
    });
};

// ======================== SUPPORT EMAIL ========================
export const sendSupportEmail = async ({ name, email, category, message }) => {
    const categoryEmoji = {
        'General Help': '❓',
        'Report a Bug': '🐛',
        'Feature Request': '💡',
        'Other Inquiry': '💬',
    };
    const emoji = categoryEmoji[category] || '📩';

    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support Request - FuelShare</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7faf9; font-family: 'Inter', Helvetica, Arial, sans-serif; color: #181c1c; -webkit-font-smoothing: antialiased;">
    <div style="max-width: 600px; margin: 40px auto; padding: 0 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 12px 32px rgba(24,28,28,0.06);">

            <!-- Header -->
            <tr>
                <td style="padding: 40px 30px 20px; text-align: center; background: linear-gradient(135deg, #005050, #006a6a);">
                    <span style="font-family: Arial, sans-serif; font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -1px;">FuelShare</span>
                    <p style="color: #a7d4d4; font-size: 13px; margin: 6px 0 0; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Support Request Received</p>
                </td>
            </tr>

            <!-- Category Badge -->
            <tr>
                <td style="padding: 30px 30px 0; text-align: center;">
                    <div style="display: inline-block; background-color: #e6f4f4; border: 1px solid #b2d8d8; border-radius: 50px; padding: 8px 20px;">
                        <span style="color: #005050; font-size: 14px; font-weight: 700;">${emoji} ${category}</span>
                    </div>
                </td>
            </tr>

            <!-- Sender Info -->
            <tr>
                <td style="padding: 25px 30px 10px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f4f3; border-radius: 10px; padding: 20px;">
                        <tr>
                            <td style="padding: 12px 20px;">
                                <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #6e7979; text-transform: uppercase; letter-spacing: 1px;">From</p>
                                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #181c1c;">${name}</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 20px 12px;">
                                <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #6e7979; text-transform: uppercase; letter-spacing: 1px;">Reply To</p>
                                <a href="mailto:${email}" style="margin: 0; font-size: 15px; font-weight: 600; color: #006a6a; text-decoration: none;">${email}</a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- Message Body -->
            <tr>
                <td style="padding: 20px 30px 30px;">
                    <p style="margin: 0 0 10px; font-size: 11px; font-weight: 700; color: #6e7979; text-transform: uppercase; letter-spacing: 1px;">Message</p>
                    <div style="background-color: #ffffff; border: 1px solid #e0e3e2; border-left: 4px solid #006a6a; border-radius: 8px; padding: 20px;">
                        <p style="margin: 0; font-size: 15px; color: #3e4948; line-height: 1.7; white-space: pre-wrap;">${message}</p>
                    </div>
                </td>
            </tr>

            <!-- Divider -->
            <tr><td style="height: 1px; background-color: #e6e9e8;"></td></tr>

            <!-- Footer -->
            <tr>
                <td style="background-color: #ebeeee; padding: 25px 30px; text-align: center;">
                    <p style="color: #3e4948; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px;">
                        FuelShare — Campus-Exclusive Ride-Sharing Platform
                    </p>
                    <p style="color: #6e7979; font-size: 10px; margin: 0;">© 2026 FuelShare Academic Collective. This is an automated support notification.</p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>`;

    return await transporter.sendMail({
        from: `"FuelShare Support" <${process.env.SMTP_EMAIL}>`,
        to: process.env.SMTP_EMAIL,          // Send to the admin inbox (same as OTP sender)
        replyTo: email,                       // Reply goes directly to the user's email
        subject: `${emoji} [FuelShare Support] ${category} — from ${name}`,
        html: htmlTemplate,
    });
};

