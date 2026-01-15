import { json } from "express";
import { redisClient } from "../config/redis.js";
import apiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const cacheTask = asyncHandler(async (req , res , next) => {
    const {teamId} = req.params

    const queryKey = new URLSearchParams(req.query).toString()

    const cacheKey = `tasks: ${teamId}: ${queryKey || all}`

    const cacheData = await redisClient.get(cacheKey)

    if(cacheData) {
        const data = JSON.parse(cacheData)
        return res
        .status(200)
        .json(new apiResponse(200,data,"Data fetched Successfully"))
    }

    req.cacheKey = cacheKey
    next()
})