import User from "../module/user.module.js";
import apiError from "./apiError.js";

const generateToken = async (userId) => {
    try {
        
        const user = await User.findById(userId)
        if(!user) {
            throw new apiError(404, "user not found")
        }
        const accessToken = user.generateAccessToken()

        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        if(user.refreshToken) console.log("refresh token saved to db")
        console.log()
        
        return {accessToken , refreshToken}
    } catch (error) {
            console.log("error while generating token", error.message)
    }

}

export default generateToken;