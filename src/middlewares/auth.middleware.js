import { User } from "../models/user.model.js";
import { ApiError } from "../utilities/ApiError.js";
import { asyncHandler } from "../utilities/asyncHandler.js";
import jwt from "jsonwebtoken";


export const verifyJWT = asyncHandler(async (req, _, next) => {
    // _ means we are not using the response object. (res)
    // if user doesn't has access token like in MOBILE SCENARIO
   try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")
     // In postman like this: key: Authorization, value: Bearer <token>  , replace the bearer and the space with "" empty string.
 
     if(!token) {
         throw new ApiError(401, "You are not authorized to access this resource!")
     }
 
     // verify the token means if user has token or not using jwt.verify method.
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
     // verify can be only done who has the secret key.  So, only the server can verify the token.
     // if token is valid, then decodedToken will have the payload of the token.
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
     // find the user by _id declare in the userModel.js under jwt.sign and remove the password and refreshToken from the user object.
     // if user is not found, then throw error.
     if(!user) {
         throw new ApiError(401, "Invalid Access Token!")
     }
 
     req.user = user 
     // add the user to the request object so that we can use it in the next middleware or controller.
     // req.user will have the user object without password and refreshToken.
     next()
     // call the next middleware or controller.
   } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token!!!!!")
   }
})