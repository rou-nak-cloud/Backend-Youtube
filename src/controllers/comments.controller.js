import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";


// get video comments (all comments from a video)
const geyVideoComments = asyncHandler(async(req, res) => {
    const {videoId} = req.params
    const {page=1, limit=10} = req.query

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Video id is not valid!!")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "video not found to fetch comments")
    }

    // match and find all the comments
    const aggregateComment = Comment.aggregate([
        // When using aggregatePaginate, you don't need to use await on the aggregate() function by itself.
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        }
    ])
      await Comment.aggregatePaginate(aggregateComment,{
        page: parseInt(page),
        limit: parseInt(limit)
        // Aggregation Pipeline: The aggregation itself is being handled by aggregatePaginate when you pass the aggregation pipeline as the first argument.
        // Pagination: aggregatePaginate will automatically execute the aggregation and return the paginated results.
    })
    .then((result) => {
        return res.status(200).json(
            new ApiResponse(201, result, "Video comments fetched successfully")
        )
    })
    .catch((error) => {
        throw new ApiError(500, "Something went wrong while fetching comments for the video!!", error)
    })
})

// const result = await Comment.aggregatePaginate(
//     Comment.aggregate([
//       { $match: { video: new mongoose.Types.ObjectId(videoId) } }
//     ]),
//     {
//       page: parseInt(page),
//       limit: parseInt(limit),
//     }
//   );
//   if(!result){
//     throw new ApiError(500, "something went wrong while getting video comments")
//   }
//   return res
//     .status(200)
//     .json(new ApiResponse(200, result, "Video comments fetched successfully"));
// });

// get tweet comments

const getTweetComments = asyncHandler(async(req,res) => {
    const {tweetId} = req.params
    const { page=1, limit=10} = req.query

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Tweet id is not valid..")
    }

    const tweet = await Tweet.findById(tweetId)
    if(!tweetId){
        throw new ApiError(400, "Tweet not found..")
    }

    // match and find all the comments
    const aggregateTweetComments = Comment.aggregate([
        {
            $match: {
                tweet: new mongoose.Types.ObjectId(tweetId)
            }
        }
    ])
    await Comment.aggregatePaginate(aggregateTweetComments,{
        page: parseInt(page),
        limit: parseInt(limit)
    })
    .then((result) => {
        return res.status(201).json(
            new ApiResponse(200, result, "Tweet comments fetched successfully!!")
        )
    })
    .catch((error) => {
        throw new ApiError(500, "Something went wrong while fetching tweet comments!!", error)
    })

})


// VIDEOS

// add comment to video
const addComment = asyncHandler(async(req,res) => {
    const {comment} = req.body
    const {videoId} = req.params

    if(!comment || comment?.trim()===""){
        throw new ApiError(400, "Comment field is required!!")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Video id is not valid!!")
    }

    const videoComment = await Comment.create({
        content: comment,
        video: videoId,
        owner: req.user._id
    })
    if(!videoComment){
        throw new ApiError(500, "something went wrong while creating video comment")
    }

    return res
    .status(200)
    .json(new ApiResponse(201, videoComment, "video comment created successfully"))
})

// update Comment
const updateCommentToVideo = asyncHandler(async (req, res) => {
    const { newContent } = req.body 
    const { commentId } = req.params

    if(!newContent || newContent?.trim()===""){
        throw new ApiError(400, "content is required")
    }

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "This video id is not valid")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "comment not found!");
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to update this comment!");
    }

    const updateComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content: newContent
            }
        },
        {
            new: true
        }
    )

    if(!updateComment){
        throw new ApiError(500, "something went wrong while updating comment")
    }

    // return response
   return res.status(201).json(
    new ApiResponse(200, updateComment, "comment updated successfully!!"))
})


// delete comment to video 
const deleteCommentToVideo = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "This video id is not valid")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "comment not found!");
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to delete this comment!");
    }

    const deleteComment = await Comment.deleteOne({
        _id: commentId
    })
    if(!deleteComment){
        throw new ApiError(500, "something went wrong while deleting comment")
    }

    // return response
    return res.status(201).json(
        new ApiResponse(200, deleteComment, "comment deleted successfully!!"))
})

// TWEETS

// add comment to tweet 
const addCommentToTweet = asyncHandler(async (req, res) => {
    const { comment } = req.body;
    const { tweetId } = req.params

    if( !comment || comment?.trim()===""){
        throw new ApiError(400, "comment is required")
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "This tweet id is not valid")
    }

    const tweetComment = await Comment.create({
        content: comment,
        tweet: tweetId,
        owner: req.user._id
    })

    if(!tweetComment){
        throw new ApiError(500, "something went wrong while creating tweet comment")
    }

    // return response
        return res.status(201).json(
        new ApiResponse(200, tweetComment, "Tweet comment created successfully!!")
    );
})


// update comment to Tweet
const updateCommentToTweet = asyncHandler(async (req, res) => {
    const { newContent } = req.body 
    const { commentId } = req.params

    if(!newContent || newContent?.trim()===""){
        throw new ApiError(400, "content is required")
    }

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "This video id is not valid")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "comment not found!");
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to update this comment!");
    }

    const updateTweetComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content: newContent
            }
        },
        {
            new: true
        }
    )

    if(!updateTweetComment){
        throw new ApiError(500, "something went wrong while updating comment")
    }

    // return response
   return res.status(201).json(
    new ApiResponse(200, updateTweetComment, "comment updated successfully!!"))
})


// delete comment to tweet 
const deleteCommentToTweet = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "This tweet id is not valid")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "comment not found!");
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to delete this comment!");
    }

    const deleteTweetComment = await Comment.deleteOne({
        _id: commentId
    })

    if(!deleteTweetComment){
        throw new ApiError(500, "something went wrong while deleting comment")
    }

    // return response
    return res.status(201).json(
        new ApiResponse(200, deleteTweetComment, "comment deleted successfully!!"))
})



export { geyVideoComments,
    getTweetComments,
    addComment,
    updateCommentToVideo,
    deleteCommentToVideo,
    addCommentToTweet,
    updateCommentToTweet,
    deleteCommentToTweet,
 }