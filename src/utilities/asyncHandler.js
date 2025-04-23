// const asyncHandler = (requestHandler) => {
//     return (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
//     }
// }


// (req,res,next,err) The function signature is incorrect. Express doesn't pass err as a 4th param to normal route handlers — that's for error-handling middleware only.
// It's returning a 4-parameter function, which Express does not treat as a regular route handler, so it won’t run properly for app.get, app.post, etc.
// You’d only use (err, req, res, next) if you're writing a custom error-handling middleware.
const asyncHandler = (fn) => async(req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}
export {asyncHandler}
// This function is used to handle async errors in express routes. It takes a function as an argument and returns a new function that wraps the original function in a try-catch block. If an error occurs, it sends a JSON response with the error message and status code.

// What is asyncHandler?
// asyncHandler is a higher-order function.
// A higher-order function is a function that takes another function as an argument and possibly returns a new function.

// Why is asyncHandler needed?
// In Express.js, if an asynchronous function throws an error, you need to explicitly pass that error to the next function for the Express error-handling middleware to catch it. Without this, your server might crash or not handle the error properly.