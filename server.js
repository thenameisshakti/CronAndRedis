import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./src/db/index.js";
import { startActivityCron } from "./src/cron/activity.cron.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    startActivityCron()
    app.listen(PORT, () => {
      console.log(`\n SERVER RUNNING at the PORT: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(
      "error while connecting to database and starting the server",
      error
    );
  });
