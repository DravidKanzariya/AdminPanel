import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new Schema(
  {
    username: {
      type: String,
      required:  [true,"Username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true,"Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      default: "",
    },
    parentId: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: ["super-admin","admin","trainer","user"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["","active","inactive","invitation sent","invitation accepted","password not set","verified"],
      default: "",
    },
    registeredThrough: {
      type: String,
      enum: ["super-admin","admin","trainer","signup-method"],
      default: "signup-method",
    },
    refreshToken: {
      type: String
    },
    setToken: {
      type: String
    },
    resetPasswordToken: {
      type: String
    }
  }, {
  timestamps: true
}
)

userSchema.index({username:"text",email:"text",role:"text",registeredThrough:"text"});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10)
  next();
})


userSchema.methods.isPasswordCorrect = async function
  (password) {
  // console.log(password);
  // console.log(this.password);
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role:this.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )


}
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,

    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}
export const User = mongoose.model("User", userSchema)

