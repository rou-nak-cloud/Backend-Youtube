import mongoose from 'mongoose';
import {DB_NAME} from "../constants.js"

// Using async/await to connect to the database and start the server
// Production code with error handling

const connectDB = async ()=> {
    try {
        const connectedInstances =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) 
        console.log(`\n Connected to MongoDB database successfully at HOST: ${connectedInstances.connection.host}`);
    } catch (error) {
        console.log("ERROR: ", error);
        process.exit(1);
        // throw error;
    }
}
export default connectDB;




/*Using IFEE (Immediately Invoked Function Expression) to connect to the database and start the server
and handle errors.

import express from 'express';
const app = express();
(async () => {
    try {
        mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("Error in DB connection", error);
            throw error;
        })
        app.listen(process.env.PORT, ()=> {
            console.log(`Server is running on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("ERROR: ", error);
        throw error;
    }
})()
*/