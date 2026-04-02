import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "axionxinex@gmail.com",
        pass: "lwki kzew hngp lewh" // App Password
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
                        &copy; 2024 FuelShare Technologies Inc.
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
