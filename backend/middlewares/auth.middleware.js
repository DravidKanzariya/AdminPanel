
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.js';

const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // const token = req.cookies?.accessToken || req.header
        //     ("Authorisation")?.replace("Bearer ", "")
        // console.log(req.cookies);
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unuthorised request")
        }
        // console.log("test2")
        // const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // console.log(decodedToken);
        // console.log("test3");
        const user = await User.findById(decodedToken?._id)
            .select("-refreshToken")

        if (!user) {

            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;
        // console.log(user);
        next()
    } catch (error) {

        throw new ApiError(401, error?.message || "Invalid access token")
    }
})


export {
    verifyJWT,

}