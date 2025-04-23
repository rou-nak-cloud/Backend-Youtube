import { ApiError } from "../utilities/ApiError.js"
import {asyncHandler} from "../utilities/asyncHandler.js"
import { User } from "../models/user.model.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utilities/cloudinary.service.js"
import { ApiResponse } from "../utilities/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"


const generateAccessTokenAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        // for access token we will use the userId to get the user details from DB and then generate the access token.
        const refreshToken = user.generateRefreshToken()
        // save the refresh token in the user model in DB for, user not to give password every time access token expired 

        // now save the refresh token in the user model in DB for, user not to give password every time access token expired
        user.refreshToken = refreshToken
        // added in user the refreshToken,, now save it in DB
        await user.save( {validateBeforeSave: false} )
        // validateBeforeSave: false is used to skip the validation of the user model before saving it in DB.  We don't want to validate the user model again and again.
        // because we are already validating it in the registerUser function.  So, we are using this option to skip the validation , as mongo db kicks in and validate the user model before saving it in DB along with the password.

        // till now if tokens generate successfully =, return the tokens
        return { accessToken, refreshToken}
         
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access token and refresh token")
    }
}
// Now call the function in the loginUser function and get the tokens and send them to the user.

const registerUser = asyncHandler( async (req, res, next) => {
    // res.status(200).json({
    //     message: "OK"
    // })


    // Steps for registering a user: LOGIC BUILDING 

    // get user details from frontend
    // Validation check.   Through ApiError we created. 
    // check if user already existed: email and username etc
    // if not existed then create a new user by taking avatar, images like that.
    // then upload them in cloudinary through multer like avatar AND MUST DOUBLE CHECK FOR AVATAR ON CLOUDINARY
    // create a user object in DB, create a entry in DB; with the details we got from frontend
    // after creating a object in DB, we will get the whole response of the user object we created in DB along with the password and tokens so,
    // remove the password and tokens from the response we got from DB. we don't want to give this to user. 
    // Check for user creation ? 
    // return the res (response) as user has created successfully.  Through ApiResponse we created.

    // User details
    const { fullName, email, password, username } = req.body
    // console.log("email: ", email)
    // console.log("fullName:  ", fullName)
    // console.log("password: ", password)
    console.log("username: ", username)

    // Validation
    if ([fullName, email, password, username].some((field) => field?.trim() === "" ))  
        {
            throw new ApiError(400, "All fields are required")   
     }
     if (!email.includes("@")) {
        throw new ApiError(400, "Email is not valid")
     }
     if (password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters long")
     }
     
    //  Check if user already exists
    // User is from MOngo db, import it from the model
    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (existedUser) {
        throw new ApiError(409, "User already with username or email is existed!")
    }

    // Create a new avatar and cover image localStorage path through multer
    // console.log(req.files)

    // const avatarLocalPath =  req.files?.avatar[0]?.path; 
    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path
    } 
    else {
        throw new ApiError(400, "Avatar is required")        
    }
    // if (!avatarLocalPath) {
    //     throw new ApiError(400, "Image is required")
    // }

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // because "?" this will give undefined if the file is not present.  So, we are using optional chaining here.
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coveImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.coverImage[0].path
    }
    // console.log("avatarPath: ", avatarLocalPath)

    
    // upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // console.log("avatar upload response:", avatar);
    if (!avatar) {
        throw new ApiError (400, "Image is required !!!")
    }

    // Create a new user in DB.  Use Await as DB is in another continent.
    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    // now we dont want to send the password and refresh token to the user. And mongo db always give an _id to every ENTRY created.
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
        //  "-" means exclude the field from the response
    )
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating user!")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully"
        // 200 is the status code, createdUser is the data, and success message is the message to be sent to the user.  201 - created and 200 - ok
        )
    )
})

const loginUser  = asyncHandler ( async (req, res, next) => {
    // req.body -> take the data from frontend
    // check his validation by username  or email
    // verify by using password, 
    // generate access and refresh tokens -> access token is for authentication and refresh token is for getting new access token when it expires.
    // send those tokens as a Cookie.
    // Login success...
    

    // console.log("Body:", req.body);  use json format in postman for no error ONLY through multer i can use form-data
    if (!req.body) {
        throw new ApiError(400, "Request body is missing");
    }

    const { username, email, password } = req.body;
    console.log("username:", username, "email:", email, "password:", password);

    if ([username || email].some((field) => field?.trim() === "")){
        throw new ApiError(400, "One field required!")
    }
    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required!")
    }
    //find the user before login with password
    // user -> our stored instance of User from mongoDB   ;  User -> model from mongoDB  !important
    const user =await User.findOne({
        $or: [ {username}, {email} ]
    })
    if (!user){
        throw new ApiError(404, "User not Found! ")
    }

    // password check
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Password!")
    }

    // generate access and refresh tokens METHODs declare at top and call them here.
    const { refreshToken, accessToken} = await generateAccessTokenAndRefreshToken(user._id)
    // may take time so use await and in what return i get => destructure the access and refresh tokens.

    // we don't want to give the password and refresh token to the user.  So, i will remove them from the response.
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // now sent SECURE cookies
    const options = {
        httpOnly: true,  // this cookie is not accessible to the client side javascript.  It is only accessible to the server side javascript.
        secure: true, // this cookie is only sent over HTTPS.  So, it is secure.
    } 

    return res
    .status(200)
    .cookie("accessToken", accessToken, options) 
    // access token is the name of the cookie and accessToken is the value of the cookie.
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200,
            {
                user: loggedInUser, accessToken, refreshToken
                // user is the user object we got from DB, accessToken is the access token we generated, refreshToken is the refresh token we generated.
                //  we are doing this because if user want to give his own access token then we will use this access token to authenticate the user same as we for refresh token. (MAINLY FOR SAVE)by the user.
            },
            "User logged in successfully"
            // 200 is the status code, user is the data, and success message is the message to be sent to the user.  200 - ok
        )
    )

})


const logoutUser = asyncHandler( async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,{
            $set: {
                refreshToken: undefined
                // set the refresh token to undefined.  So, the user will be logged out.
            }
            //  $unset: {
            //     refreshToken: 1  this will also remove the field from the document.
            //    }
        },
        {
            new: true 
            // new: true means return the updated user object.
            // if false then it will return the old user object.
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {user}, "User logged Out!!"))
})

 
const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken 
    // if refresh token is not present in cookies then take it from body like in mobile app or postman.
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Action")
    }
    
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        // decodedToken is the token we got from the user.  we will use this token to find the user in DB.
        if (!user) {
            throw new ApiError(401, "Invalid refresh token as User is not Authorized")
        }
    
        // Now match with our db stored refresh token (declare in generateAccessAndRefreshToken) with the incoming refresh token which is being decoded to find the user of that token.
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token Expired")
        }
    
        // Now generate new access token and refresh token for the user.
        const options = {
            httpOnly: true,
            secure: true
        }
        const {newRefreshToken, accessToken} = await generateAccessTokenAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    accessToken, refreshToken : newRefreshToken
                },
                "Access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized action as invalid refresh token")
    }
})


const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword, confirmPassword} = req.body

    if (!oldPassword || !newPassword || !confirmPassword) {
        throw new ApiError(400, "All fields are required");
    }
    
    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "New password and confirm password do not match");
    }
    // This compares the new password and confirm password.
    // If they don't match, it stops the process and throws an error.
    // This prevents the user from accidentally setting the wrong password.

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Old Password")
    }

    user.password = newPassword
    // user old password will replace with new Password,  NOW look into the user model at the { .pre"Save" }
    // till now user is ONLY SET, not saved..

    // Now SAVED the Password
    await user.save({validateBeforeSave: false})
    // Only save, not check every other details so validation check is set to false...
    // validateBeforeSave: false means only the modified fields are saved — it skips validating the entire user schema again.

    return res
    .status(200)
    .json( new ApiResponse(200, {}, "Password changed successfully!"))
})

const getCurrentUser = asyncHandler(async(req,res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"))
})


const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body
    
    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required!")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                fullName,
                email
                // email: email   right but inconsistency
            }
    }, 
    { new: true}
    ).select("-password -refreshToken")

    return res.status(200)
    .json( new ApiResponse(200, user, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path
    // only single file not the whole files ARRAY!!
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    // Delete old avatar from Cloudinary if exists
    const user = await User.findById(req.user._id)
    const oldAvatarUrl = user.avatar
    if (oldAvatarUrl) {
        const publicId = oldAvatarUrl.split("/").pop().split(".")[0] // extract the id from the url
        await deleteFromCloudinary(publicId)
    }

    // Upload new avatar if not exist..
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar) {
        throw new ApiError(400, "Error while uploading in cloudinary")
    }
    const updateUser = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                avatar: avatar.url
                // not Only avatar as it will return the whole object..
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    return res.status(200)
    .json( new ApiResponse(200, updateUser, "Avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image is file is missing")
    }
    
    // delete old cover Image if exists
    const user = await User.findById(req.user._id)
    const oldCoverImageUrl = user.coverImage
    if (oldCoverImageUrl) {
        const publicId = oldCoverImageUrl.split("/").pop().split(".")[0]
        await deleteFromCloudinary(publicId)
    }

    // upload on cloudinary
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)
   if (!coverImage) {
    throw new ApiError(400, "Cover Image upload on cloudinary failed")
   }

   const updateUser = await User.findByIdAndUpdate(req.user?._id,
    {
        $set: {
            coverImage: coverImage.url
        }
    },
    {new: true}
   ).select("-password -refreshToken")

   return res
   .status(200)
   .json( new ApiResponse(200, updateUser, "Cover Image uploaded successfully"))
})

const getUserChannelProfile = asyncHandler(async(req,res) => {
    const {username} = req.params // params means the url like: url/username => user channel profile
    // GET /api/v1/users/channel/rounak → username = "rounak"
    // console.log("Logged-in user:", req.user);

    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing")
    }

    // aggregation and Pipelining
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        // store all the details of subscribers and subscribed to
        {
            $lookup: {  // (Get Subscribers)
                from: "subscriptions",  //plural form as of mongoDB
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
                // Join with the subscriptions collection.
                // Find all users who subscribed to this user(me) (where channel === user._id)
                // Store result in subscribers array.  
        },
        {
            $lookup: {  //(Get channels the user subscribed to)
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscribers",
                as: "subscribedTo"
            }
            // Another join: this time checking who the user has subscribed to.
            // Match where subscriber === user._id (my id)
            // Save result as subscribedTo.
        },
        // count and add the documents
        {
            $addFields: {  //Add Metadata Fields
                // subscribersCount: number of people who follow this channel
                // channelSubscribedToCount: number of other channels this user follows
                subscribersCount: {
                    $size: "$subscribers" //$ use this, cause subscribers ia a field.
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                
                isSubscribed: {
                    $cond: { //condition
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]}, //$in -> present or not
                        then: true,
                        else: false
                    }
                    // isSubscribed: boolean to check if current logged-in user is a subscriber of this channel.
                    // $in checks if req.user._id is inside the array of subscriber IDs.
                },
            }
        },
        {
            $project: {  //not give all the values , project only selected values..
                fullName: 1,  //Flag if 1 -> passed
                username: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    // console.log(channel)
    
    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist")
    }
    return res
    .status(200)
    .json( new ApiResponse(200, channel[0], "User fetched successfully"))
    // Send a 200 response with: The first (and only) user result, Success message
})

const getUserWatchHistory = asyncHandler(async(req,res) => {
        const user = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $lookup: {  //you are in users and looking in to videos  MEANS JOIN -> lookup
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    // Looking into the videos collection.
                    // Matching each User.watchHistory (an array of video IDs) with _id in videos.
                    // Saving the matched video documents into a new array field also called watchHistory.
                    pipeline: [
                        {
                            $lookup: {  // now you are in videos and looking into users;
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                // Inside each video, we perform another $lookup to fetch the video owner's user details from the users collection.
                                pipeline: [
                                    {
                                        $project: {
                                            fullName: 1,
                                            username: 1,
                                            avatar: 1
                                            // We’re only keeping these fields of the owner in the final output to reduce payload size and protect sensitive info.
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                owner: {
                                    $first: "$owner"  // or ArrayElemAt: can be used..
                                    // Since $lookup gives an array, we extract the first (and only) item in the owner array to make owner a regular nested object.
                                }
                            }
                        }
                    ]
                }
            }
        ])

        return res
        .status(200)
        .json(new ApiResponse(200, user[0].watchHistory, "Watch History fetched successfully"))
        // We return the watchHistory array from the first matched user. It now includes:
        // Full video info
        // Owner info (with name, avatar, username)
})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getUserWatchHistory
 }