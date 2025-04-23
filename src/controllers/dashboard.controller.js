import mongoose from "mongoose";
import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";


// get channel stats
const getChannelStats = asyncHandler(async(req,res) => {

 try {
       // total Likes
       const allLikes = await Like.aggregate([
           {
               $match: {
                   likedBy: req.user._id
               }
           },
           {
               $group: {
                   _id: null,  //“Don't group by any field — just treat all matching documents as a single group.”
                               // It will return one document with the total counts.
                   totalVideoLikes: {
                       $sum: {
                           $cond: [
                               {
                                   $ifNull: ["$video",false]
                               },
                               1,  //not null means there is video then add 1
                               0  // when video is not present
                           ]
                       }
                   },
                   totalTweetLikes: {
                       $sum: {
                           $cond: [
                               {
                                   $ifNull: ["$tweet", false]
                               },
                               1,
                               0
                           ]
                       }
                   },
                   totalCommentLikes: {
                       $sum: {
                           $cond: [
                               {
                                   $ifNull: ["$comment",false]
                               },
                               1,
                               0
                           ]
                       }
                   }
               }
           }
       ])
   
       // total subscribers
       const allSubscribers = await Subscription.aggregate([
           {
               $match: {
                   channel: new mongoose.Types.ObjectId(req.user._id)
               }
           },
           {
                  $count: "subscribers"  //The $count stage in MongoDB expects a string (just a plain field name for the output), not a $-prefixed field path.
           }
       ])
   
       // total videos
       const allVideo = await Video.aggregate([
           {
               $match: {
                   videoOwner: new mongoose.Types.ObjectId(req.user._id)
               }
           },
           {
               $count: "videos"  //The $count stage in MongoDB expects a string (just a plain field name for the output), not a $-prefixed field path.
           }
       ])
   
       // total views
       const allViews = await Video.aggregate([
           {
               $match: {
                   videoOwner: new mongoose.Types.ObjectId(req.user._id)
               }
           },
           {
               $group: {
                   _id: null,
                   allVideosViews: {
                       $sum: "$views"
                   }
               }
           }
       ])
   
       const stats = {
           totalVideoViews: allViews[0]?.allVideosViews || 0,
           totalVideos: allVideo[0]?.videos || 0,
           subscribers: allSubscribers[0]?.subscribers || 0,
           totalVideoLikes: allLikes[0]?.totalVideoLikes || 0,
           totalTweetLikes: allLikes[0]?.totalTweetLikes || 0,
           totalCommentLikes: allLikes[0]?.totalCommentLikes || 0
       }
   
       // return response 
       return res
       .status(200)
       .json(new ApiResponse(200, stats, "Fetching channel stats... SuccessfullY!!"))
    } catch (error) {
        console.error("Error in getChannelStats:", error);
        throw new ApiError(500, "Something went wrong while fetching channel stats");
    }
   })
   

// get channel videos
const getChannelVideos = asyncHandler(async(req,res) => {

    const allVideos = await Video.find({
        videoOwner: req.user._id
    })
    if(!allVideos){
        throw new ApiError(500, "Something went wrong while fetching all videos!!")
    }
    return res
    .status(200)
    .json(new ApiResponse(201, allVideos, "All videos are as belows.."))
})



export { getChannelVideos,
    getChannelStats,
}