import { redisClient } from "../config/redis.js"

export const clearOutdatedCahcheData = async(teamId) => {
    const keys = await redisClient.keys(`tasks: ${teamId}:*`)
    if(keys.length>0){
        await redisClient.del(keys)
    }
}