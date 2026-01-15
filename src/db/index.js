import mongoose from "mongoose";

const DB_NAME = "dupledDB"

const connectDB = async() => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MONGODB CONNECTED: ${connectionInstance.connection.host}`)
    }
    catch(error) {
        console.log("error while connection build to mongodb", error)
        process.exit(1)
    }
}

export default connectDB