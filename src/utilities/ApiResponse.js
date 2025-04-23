class ApiResponse {
    constructor(statuscode, message="Success", data){ 
        this.statuscode = statuscode // The HTTP status code
        this.message = message // The success message
        this.data = data // Set the data to the provided data
        this.success = statuscode < 400 // Set the success to true if the status code is less than 400
        // this.success = true
    }
}

export { ApiResponse } // Export the ApiResponse class