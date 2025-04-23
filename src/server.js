import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import connectDB from "./db/dbServer.js";
import app from './app.js';
// console.log("MongoDB URI:", process.env.MONGODB_URI);
// if it is error then it will show undefined. 

// till now MOngoDb is conected, not server has started.. 
connectDB()
// Now we need to start the server and listen to the requests through then and catch as it is async function,  dont put ; before .then and .catch
.then( () => {
    app.on("error", (error) => {
        console.log("Error in DB listening connection", error);
        throw error;
    })
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    })
}).catch((err) => {
    console.log("Mongo Db connection failed", err);
});


