import { Router } from "express";

import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { loginUser, logoutUser, registerUser, sendEmailWithToken, setPassword, setStatus } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyTokenMiddleware } from "../middlewares/status.middleware.js";

const router = Router();
router.route("/register").post(registerUser)
router.route("/login").post(loginUser);
//secure routes
router.route("/logout").post(verifyJWT, logoutUser)
router.post("/send-verification-email", async (req, res) => {
    const { email, id } = req.body;
    console.log(req.body)
    if (!email || !id) {
        return res.status(400).json({ error: "Email and User ID are required!" });
    }

    try {
        await sendEmailWithToken(email, id);
        res.json({ message: "Verification email sent!" });
    } catch (error) {
        res.status(500).json({ error: "Failed to send email." });
    }
});

router.get("/verify-email", async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: "Token is missing!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ message: "Email verified successfully!", _id: decoded.id });
    } catch (error) {
        res.status(400).json({ error: "Invalid or expired token." });
    }
});

router.post("/accept-invitation", async (req, res) => {
    const { token } = req.body;
// console.log("accept--",token);

    if (!token) {
        return res.status(400).json({ error: "Token is required" });
    }

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // Find the user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the token is expired
        if (Date.now() > decoded.exp * 1000) {
            return res.status(400).json({ error: "Token expired" });
        }

        // Update user status
        user.status = "invitation accepted";
        await user.save();

        //  setTimeout(async () => {
        //     if (user.status === "invitation sent") {
        //         const user= await User.findOneAndUpdate({ _id: req.user?.userId }, { status: "password not set" });
        //       console.log(`from setTimeout ---->${user}`);
               
        //     }
        // }, 2*60*1000);

        res.json({ message: "Invitation accepted", redirectTo: `/set-password?token=${token}` });
    } catch (error) {
        return res.status(400).json({ error: "Invalid or expired token" });
    }
});

router.route('/set-password').patch(verifyTokenMiddleware, setPassword);
router.route('/set-status').patch(setStatus);


export default router;
