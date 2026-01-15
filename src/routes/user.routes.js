import express from "express";
import { Router } from "express";
import { registerUser,
        loginUser,

 } from "../controller/user.controller.js";
 import { loginLimiter } from "../middleware/rateLimit.middleware.js";

const userRouter = Router()

userRouter.route('/register').post(registerUser)
userRouter.route('/login').post(loginLimiter,loginUser)

export default userRouter