import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import { ApiResponse } from "../utilities/ApiResponse.js";

const healthCheck = asyncHandler(async(req, res) => {
    const healthCheck = {
        uptime: process.uptime(),  //How long the server has been running (in seconds).
        message: "OK",      //	A simple status string — here it's 'ok'.
        responseTime: process.hrtime(), //	High-resolution time since the process started, returned as [seconds, nanoseconds]. Useful for calculating precise timings.
        timeStamps: Date.now()  	// The current date & time in milliseconds since epoch (Date.now()).
    }
    try {
        return res
        .status(201)
        .json(new ApiResponse
            (200, healthCheck, "Health is good"))
    } catch (error) {
        console.error("Error in Health Check", error)
        healthCheck.message = error;
        throw new ApiError(503, "getting Error in health check time..")
    }
})

export { healthCheck }