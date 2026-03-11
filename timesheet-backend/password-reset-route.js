// Add this route to server.ts for password reset
app.post("/api/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required" });
    }

    // Find user by email
    const user = await prisma.employee.findUnique({
      where: { officeEmail: email }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash new password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.employee.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    console.log(`Password reset for ${email}: ${newPassword}`);

    res.json({ 
      message: "Password reset successfully",
      email: email,
      newPassword: newPassword
    });

  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});
