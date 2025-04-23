import mongoose, {isValidObjectId} from "mongoose";
import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import {ApiResponse} from "../utilities/ApiResponse.js"
import { User } from "../models/user.model.js";
import { Tweet } from "../models/tweet.model.js"

// Create tweet
const createTweet =asyncHandler(async(req, res) => {
    const {content} = req.body
    if(!content || content?.trim()===""){
        throw new ApiError(400,"Content  is required!!")
    }

    // create tweet
    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })
    if(!tweet){
        throw new ApiError(500, "Something went wrong while creating the tweet..")
    }

    return res
    .status(200)
    .json(new ApiResponse(201, tweet, "Tweet created successfully :)"))
})

// get all Tweet of user by Id
const getUserTweet = asyncHandler(async(req,res) => {
    const { userId} =req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "User id is validated to find tweets")
    }

      // find user in database 
    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(400, "User not found")
    }

    // match and find all tweets
    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: user._id
            }
        }
    ])
    if(!tweets){
        throw new ApiError(500, "something went wrong while fetching tweets")
    
    }
    // return response
     return res.status(200).json(
        new ApiResponse(201, tweets, "tweets fetched  successfully!!"))
})


// Update tweet
const updateTweet = asyncHandler(async(req,res) => {
    const { newContent } = req.body
    const { tweetId } = req.params

    if(!newContent || newContent?.trim()===""){
        throw new ApiError(400, "Some content is required!!")
    }
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Valid tweet id ias required")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404, "Cant find any Tweet")
    }
    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You don't have permission to update this tweet..")
    }

    const updateTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: newContent,
            }
        },
        {
            new: true
        }
    )

    if(!updateTweet){
        throw new ApiError(500,"Something went wrong while updating tweet..")
    }

    return res
    .status(200)
    .json(new ApiResponse(201, updateTweet, "Tweet updated successfully"))
})


// delete Tweet
const deleteTweet = asyncHandler(async(req,res) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Id not valid")
    }

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(400, "Tweet not found!!")
    }
    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(400, "You don't have permission to delete this tweet..")
    }

    const deleteTweet = await Tweet.deleteOne(
        {
            _id: tweetId
        }
    )
    // You already have the document (e.g., for validation) -> 	doc.deleteOne()
    // You only have the ID and no need to check other fields -> 	Tweet.findByIdAndDelete(tweetId)
    // You want to delete based on any condition ->	Tweet.deleteOne({ _id: tweetId })
    
    return res
    .status(201)
    .json(new ApiResponse(200, deleteTweet, "Tweet deleted successfully.."))
})


export { createTweet,
    updateTweet,
    deleteTweet,
    getUserTweet,
}