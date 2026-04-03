const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

// Generate secure reset token
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Send password reset email
async function sendResetEmail(email, resetToken) {
  // In a real implementation, you would use a service like SendGrid, Nodemailer, etc.
  // For now, we'll just log the reset link
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
  
  console.log(`📧 Password reset link for ${email}:`);
  console.log(`   ${resetLink}`);
  console.log(`   Link expires in 15 minutes`);
  
  // TODO: Replace with actual email service integration
  return true;
}

// Forgot password endpoint
async function handleForgotPassword(req, res) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    // Check if user exists
    const user = await prisma.employee.findUnique({
      where: { officeEmail: email }
    });

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address' });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset token in database
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        email: email,
        token: resetToken,
        expiresAt: expiryTime,
        createdAt: new Date()
      }
    });

    // Send reset email
    await sendResetEmail(email, resetToken);

    res.json({ 
      message: 'Password reset link sent to your email address',
      email: email
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
}

// Reset password endpoint  
async function handleResetPassword(req, res) {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Find valid reset token
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        token: token,
        expiresAt: { gt: new Date() }
      }
    });

    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Get user
    const user = await prisma.employee.findUnique({
      where: { id: resetRecord.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.employee.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // Delete the reset token
    await prisma.passwordReset.delete({
      where: { id: resetRecord.id }
    });

    console.log(`✅ Password reset successful for ${user.officeEmail}`);

    res.json({ 
      message: 'Password reset successfully',
      email: user.officeEmail
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
}

module.exports = {
  handleForgotPassword,
  handleResetPassword,
  generateResetToken,
  sendResetEmail
};
