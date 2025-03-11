import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const generateAccessAndRefreshTokens = async (userId) => {

    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { email, username, password } = req.body

    if (
        [email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const user = await User.create({
        email,
        password,
        username: username.toLowerCase()
    })

    async function createIndexes() {
        await User.syncIndexes();
        console.log("Indexes created successfully!");
    }
    createIndexes();

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {

    const { email, username, password, status } = req.body

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    if (user.status === "inactive" ) {
        throw new ApiError(404, "You can not login right now. Please contact for support... ")
    }

    if (user.status ===  "invitation sent" || "invitaion accepted" || "password not set" ) {
        throw new ApiError(404, "Password has not set. Please set password to login.... ")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))


})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorised request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, " Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const addUser = asyncHandler(async (req, res) => {

    const { email, username, password } = req.body
    const { _id, role } = req.user

    if (
        [email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const user = await User.create({
        email,
        password,
        username: username.toLowerCase(),
        registeredThrough: role,
        parentId: _id

    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email, username } = req.body

    if (!id) {
        throw new ApiError(400, "User ID is required");
    }

    const user = await User.findByIdAndDelete(id);

    console.log("Deleted user", user);
    if (!user) {
        throw new ApiError(500, "Something went wrong while deleting the user")
    }

    return res.status(201).json(
        new ApiResponse(200, user, "User deleted Successfully")
    )

})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(201, req.user, "User fetched Successfully"));
});

const getUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page);
    const pageSize = parseInt(req.query.pageSize);
    const statusGot = req.query?.status || "all";
    const searchQuery = req.query.search?.trim();
    const parentId = req.query.id ? req.query.id : req.user._id
    
    let filter = {
        parentId
    };

    if (statusGot !== "all") {
        filter.status = statusGot;
    }

    if (searchQuery) {
        filter.$or = [
            { username: { $regex: searchQuery, $options: "i" } }, 
            { email: { $regex: searchQuery, $options: "i" } },
            { role: { $regex: searchQuery, $options: "i" } },
            { registeredThrough: { $regex: searchQuery, $options: "i" } }
        ];
    }

 
    const totalUsers = await User.countDocuments(filter);

     const users = await User.find(filter)
        .select("-password -refreshToken -createdAt -updatedAt -__v")
        .skip(page * pageSize)
        .limit(pageSize);

    if (!users.length) {
        throw new ApiError(404, ` '${statusGot}' not found`);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { Users: users, total: totalUsers },
            "Users Data fetched Successfully..."
        )
    );
});
const getAdmins = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page);
    const pageSize = parseInt(req.query.pageSize);
    const statusGot = req.query.status;
    const searchQuery = req.query.search?.trim();

    const parentId = req.query.id ? req.query.id : req.user._id
   
    let filter = {
        parentId
    };

    if (statusGot !== "all") {
        filter.status = statusGot;
    }

    if (searchQuery) {
        filter.$or = [
            { username: { $regex: searchQuery, $options: "i" } }, 
            { email: { $regex: searchQuery, $options: "i" } },
            { role: { $regex: searchQuery, $options: "i" } },
            { registeredThrough: { $regex: searchQuery, $options: "i" } }
        ];
    }

    const totalAdmins = await User.countDocuments(filter);

    const admins = await User.find(filter)
        .select("-password -refreshToken -createdAt -updatedAt -__v")
        .skip(page * pageSize)
        .limit(pageSize);

    if (!admins.length) {
        throw new ApiError(404, ` '${page}' not found`);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { Admins: admins, total: totalAdmins },
            "Trainers Data fetched Successfully..."
        )
    );
});
const getTrainers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page);
    const pageSize = parseInt(req.query.pageSize);
    const statusGot = req.query.status || "all";
    const searchQuery = req.query.search?.trim();

    const parentId = req.query.id ? req.query.id : req.user._id
    
    let filter = {
        parentId
    };

    if (statusGot !== "all") {
        filter.status = statusGot;
    }

    if (searchQuery) {
        filter.$or = [
            { username: { $regex: searchQuery, $options: "i" } }, 
            { email: { $regex: searchQuery, $options: "i" } },
            { role: { $regex: searchQuery, $options: "i" } },
            { registeredThrough: { $regex: searchQuery, $options: "i" } }
        ];
    }

    const totalTrainers = await User.countDocuments(filter);

    const trainers = await User.find(filter)
        .select("-password -refreshToken -createdAt -updatedAt -__v")
        .skip(page * pageSize)
        .limit(pageSize);

    if (!trainers.length) {
        throw new ApiError(404, ` '${page}' not found`);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { Trainers: trainers, total: totalTrainers },
            "Trainers Data fetched Successfully..."
        )
    );
});

const authAdmin = asyncHandler(async (req, res) => {
    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const role = req.user.role;

    return res.status(200).json(new ApiResponse(200, { role }, `${role} Authenticated`));
});

const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params; 
    const { email, username, role, status, registeredThrough, password, parentId } = req.body;

    if (!id) {
        throw new ApiError(400, "User ID is required");
    }

    if (!email && !username && !role && !status && !registeredThrough && !parentId) {
        throw new ApiError(400, "At least one field required");
    }

    const user = await User.findById(id); 

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (email) user.email = email;
    if (role) user.role = role;
    if (status) user.status = status;
    if (parentId) user.parentId = parentId;
    if (registeredThrough) user.registeredThrough = registeredThrough;
    if (password) user.password = password;
    if (username) {
        const isExists = await User.findOne({ username });
        if (isExists && isExists._id.toString() !== id) {
            throw new ApiError(400, "Username not available");
        }
        user.username = username;
    }

    const updatedUserData = await user.save();

    if (!updatedUserData) {
        throw new ApiError(500, "Error while updating user data");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUserData, "Profile updated successfully"));
});

const sendEmailWithToken = asyncHandler(async (userEmail, userId) => {
    try {
        const user = await User.findById(userId)
        const token = jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "330s" });
        user.setToken = token;

        await user.save({ validateBeforeSave: false })
        const verificationLink = `${process.env.CLIENT_URL}/accept-invitation?token=${token}`;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });


        const mailOptions = {
            from: `"Your App" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: "Verify Your Email ",
            html: `
        <h2>Verify Your Email</h2>
        <p>Click the button below to accept the invitation:</p>
        <a href="${verificationLink}" style="background-color: blue; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
        <p>This link will expire in 5 minutes.</p>
    `,
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent!");
    } catch (error) {
        console.error("Error sending email:", error);
    }
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetURL = `http://localhost:3000/reset-password?token=${resetToken}`;
    await sendEmail(email, "Password Reset Request", `Click here to reset your password: ${resetURL}`);

    res.status(200).json({ message: "Reset link sent to email." });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful. You can now log in." });
});

const setPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ error: "Token and password are required!" });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ error: "User not found!" });
        }

        // Update password
        user.password = password;
        user.status = "verified"; 
        await user.save();

        res.json({ message: "Password set successfully. Account verified." });

    } catch (error) {
        return res.status(400).json({ error: "Invalid or expired token!" });
    }
});

const setStatus = asyncHandler(async (req, res) => {
    const { token, status } = req.body;

    if (!token || !status) {
        return res.status(400).json({ error: "Token and password are required!" });
    }

    try {

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ error: "User not found!" });
        }
        user.status = status;
        const saved = await user.save();

        res.json({ message: "Status updated successfully. Password not set" });

    } catch (error) {
        return res.status(400).json({ error: "Invalid or expired token!" });
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    authAdmin,
    addUser,
    getUsers,
    deleteUser,
    updateUser,
    getCurrentUser,
    getTrainers,
    getAdmins,
    sendEmailWithToken,
    setPassword,
    forgotPassword,
    resetPassword,
    setStatus,
}