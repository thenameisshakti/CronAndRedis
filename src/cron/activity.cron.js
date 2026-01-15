import cron from "node-cron"
import { emptyActivityQueue } from "../utils/activityLogger.js"

export const startActivityCron = () => {
    cron.schedule("*/10 * * * * *", () => {
        emptyActivityQueue()
    })
    console.log("CRON JOB activate")
}