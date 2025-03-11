import jwt from 'jsonwebtoken';
import { User } from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";


const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "330s" });

    // Generate reset token

    user.resetPasswordToken = resetToken;
    await user.save();

    // Email content
    const resetURL = `http://localhost:3000/auth/reset-password?token=${resetToken}`;
    const message =
        `<h2>Click the link below to reset your password:</h2>
        <a href="${resetURL}" style="background-color: blue; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 5 minutes.</p>`


    // Send email
    await sendEmail(email, "Password Reset Request", message);

    res.status(200).json({ message: "Reset link sent to email." });
};

const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    const user = await User.findOne({
        resetPasswordToken: token
    });

    if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    await user.save();

    // Send confirmation email
    await sendEmail(user.email, "Password Reset Successful", "Your password has been successfully reset.");

    res.status(200).json({ message: "Password reset successful." });
};

export {
    forgotPassword, resetPassword
}