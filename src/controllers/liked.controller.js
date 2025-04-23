import mongoose, {isValidObjectId} from "mongoose";
import { asyncHandler } from "../utilities/asyncHandler.js";
import { ApiError } from "../utilities/ApiError.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js"
import { Video } from "../models/video.model.js";


const toggleLikeAndUnlikeVideo = asyncHandler(async(req,res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Video id is not valid!!")
    }

    // Check if the current user has already liked the video
    const likeVideo = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })

    let like
    let unlike

    if(likeVideo){
          // Unlike the video
        unlike = await Like.deleteOne({
            video: videoId,
            likedBy: req.user._id
        })
        if(!unlike){
            throw new ApiError(500, "Something went wrong while unLiking the video!!")
        }
    } else{
        // Like the video
        like = await Like.create({
            video: videoId,
            likedBy: req.user._id
        })
        if(!like){
            throw new ApiError(500, "Something went wrong while Liking the video!!")
        }
    }
    // send response
    return res
    .status(201)
    .json(new ApiResponse(200,
        {},
        `User ${like ? "liked" : "unLiked"} the video successfully!!`
    ))
})


const toggleCommentLikeAndUnlike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    // Validate commentId
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "This comment id is not valid");
    }

    // Check if the user has already liked this comment
    const commentLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    });

    let like;
    let unlike;

    if (commentLike) {
        // Unlike the comment
        unlike = await Like.deleteOne({
            comment: commentId,
            likedBy: req.user._id
        });

        if (!unlike) {
            throw new ApiError(500, "Something went wrong while unLiking the comment!!");
        }
    } else {
        // Like the comment
        like = await Like.create({
            comment: commentId,
            likedBy: req.user._id
        });

        if (!like) {
            throw new ApiError(500, "Something went wrong while liking the comment!!");
        }
    }

    // Send response
    return res.status(201).json(
        new ApiResponse(
            200,
            {},
            `User ${like ? "liked" : "unLiked"} the comment successfully!!`
        )
    );
});



const toggleTweetLikeAndUnlike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    // Validate tweet ID
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "This tweet id is not valid");
    }

    // Check if the current user already liked this tweet
    const tweetLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    });

    let like;
    let unlike;

    if (tweetLike) {
        // Unlike the tweet
        unlike = await Like.deleteOne({
            tweet: tweetId,
            likedBy: req.user._id
        });

        if (!unlike) {
            throw new ApiError(500, "Something went wrong while unLiking the tweet!!");
        }
    } else {
        // Like the tweet
        like = await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        });

        if (!like) {
            throw new ApiError(500, "Something went wrong while liking the tweet!!");
        }
    }

    // Send response
    return res.status(201).json(
        new ApiResponse(
            200,
            {},
            `User ${like ? "liked" : "unLiked"} the tweet successfully!!`
        )
    );
});


const getLikedVideos = asyncHandler(async(req,res) => {
try {
        // console.log("Reached getLikedVideos route handler");
    
        const userId = req.user._id
    
        if(!isValidObjectId(userId)){
            throw new ApiError(400, "User id is not valid!!")
        }
    
         // find user in database 
         const user = await User.findById(userId)
         if(!user){
            throw new ApiError(400,"No user is available with this id!!")
         }
    
        const likes = await Like.aggregate([
           {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId)
            }
           },
           {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideos",
                pipeline: [
                   {
                    $lookup: {
                        from: "users",
                        localField: "videoOwner",
                        foreignField: "_id",
                        as: "videoOwner",
                        pipeline: [
                            {
                                $project: {
                                    fullName: 1,
                                    username: 1,
                                    avatar: 1
                                }
                            }
                        ]
                    }
                   },
                   {
                    $addFields: {
                        videoOwner: {
                            $arrayElemAt: ["$videoOwner", 0]
                            // After your $lookup, the videoOwner field is an array — even if it has only one user in it.
                        }
                    }
                   }
                ]
            }
           },
           {
            $unwind: "$likedVideos"
           },
           {
            $replaceRoot: {
                newRoot: "$likedVideos"
                // This step replaces the entire document with the value of the likedVideos field.
                // Throw away everything else — now make likedVideos the actual root document."
            }
           }
        //    Flatten the likedVideos arrays into individual documents.
        // Return only the actual video data — no wrapping fields like _id or likedBy.
    ])
    // console.log("likes type:", typeof likes); // should be 'object'
    // console.log("likes:", likes);
          return res
         .status(200)
         .json(new ApiResponse(200, likes, "Fetched liked videos successfully!!")
        )
} catch (error) {
    console.error("Error in getLikedVideos:", error);
    throw error;
}
})

export { toggleLikeAndUnlikeVideo,
    toggleCommentLikeAndUnlike,
    toggleTweetLikeAndUnlike,
    getLikedVideos,
}