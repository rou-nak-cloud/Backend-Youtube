class ApiError extends Error { 
    constructor( 
        statuscode, // The HTTP status code
        message="Something went wrong", // The error message
        errors=[], // An array of errors
        stack="" // The stack trace
    ){
        super(message) // Call the parent constructor with the message
        this.statuscode = statuscode // Set the status code
        this.message = message // Set the message
        this.data = null // Set the data to null
        this.success = false // Set the success to false
        this.errors = errors // Set the errors to the provided errors

        if (stack) {
            this.stack = stack // Set the stack trace if provided
        } else {
            Error.captureStackTrace(this, this.constructor) // Capture the stack trace
        }
    }
   
}

export { ApiError } // Export the ApiError class