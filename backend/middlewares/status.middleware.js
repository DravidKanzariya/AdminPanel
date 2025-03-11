import jwt from 'jsonwebtoken';

const verifyTokenMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; 
        if (!token) return res.status(401).json({ message: "Unauthorized, token missing" });

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded; 
       
        next(); 
    } catch (error) {
        console.log("error ----",req.body);
        
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired, please request a new one" });
        }
        res.status(403).json({ message: "Invalid token" });
    }
};

export {

    verifyTokenMiddleware,

}