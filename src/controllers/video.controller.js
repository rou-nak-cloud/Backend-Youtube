import {Video} from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utilities/ApiError.js"
import { ApiResponse } from "../utilities/ApiResponse.js"
import { asyncHandler } from "../utilities/asyncHandler.js"
import mongoose, { isValidObjectId } from "mongoose"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utilities/cloudinary.service.js"
import { extractPublicIdFromUrl } from "../utilities/publicId.js"

const getVideoById = asyncHandler(async(req,res) => {
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(404, "Video ID ios not valid")
    }

   const video = await Video.findById({
        _id: videoId
    })
    if(!video){
        throw new ApiError(400, "Video not found")
    }

    // return response
    return res
    .status(201)
    .json(new ApiResponse(200,video, "Video fetched successfully"))
})

const getAllVideos = asyncHandler(async(req,res) => {
    try {
        // 1. Destructure query parameters from the request
        const {
            page = 1,
            limit = 10,
            query = "^video", //default search pattern
            sortBy = "createdAt",
            sortType = 1, //1 for ascending, and -1 for descending
            userId = req.user._id
        } = req.query

        // 2.Find user in the database
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found")
        }

        // 3. Aggregate query to get the videos
        const aggregateQuery = [
            {
                $match: {
                    videoOwner: new mongoose.Types.ObjectId(userId),
                    $or: [
                        { title: {$regex: query, $options: "i" } },
                        { description: {$regex: query, $options: "i" } }
                        /* 
                            videoOwner: new mongoose.Types.ObjectId(userId):

                            This ensures that only videos belonging to the user with the specified userId are returned. The new mongoose.Types.ObjectId(userId) converts the userId string to a proper ObjectId type that MongoDB understands.

                            $or:

                            This is used to match documents that satisfy at least one of the conditions in the array.

                            { title: { $regex: query, $options: 'i' } }: This uses a regular expression ($regex) to match videos where the title contains the query string (case-insensitive, because of $options: 'i').

                            { description: { $regex: query, $options: 'i' } }: Similarly, this matches videos whose description contains the query string, also case-insensitive.
                        */
                    ]
                }
                /*
                So, this stage ensures that you only get videos that:
                Belong to the specified user
                Have "query" in their title or description (case-insensitive). 
                */
            },
            {
                $sort: {
                    [sortBy]: parseInt(sortType) //// sorting by the specified field
                }
                /*
                 Purpose: This sorts the videos based on a field.

                    [sortBy]: This dynamically sets the field by which to sort. The value of sortBy (such as "createdAt", "views", etc.) is used as the key to sort by.

                    parseInt(sortType): This converts the sortType (which could be a string like "asc" or "desc") into a number:

                    1 for ascending (asc).
                    -1 for descending (desc).

                    So, this stage sorts the videos by the specified field (sortBy) in the direction (sortType).
                */
            },
            {
                $skip: (page - 1) * limit // skipping to the right page
                /*
                Purpose: This skips a number of documents to implement pagination.

                (page - 1) * limit:
                Pagination works by skipping a certain number of documents. This formula determines how many videos to skip based on the current page number and the limit of videos per page.

                For example, if page = 2 and limit = 10, it will skip (2 - 1) * 10 = 10 documents, meaning it will start from the 11th video (second page).

                So, this stage ensures you're fetching the right page of videos.
                */
            },
            {
                $limit: parseInt(limit)  // limiting results to the specified limit
                /*Purpose: This limits the number of documents returned.

                    parseInt(limit): This ensures that the limit (number of videos per page) is an integer. For example, if the limit is 10, only 10 videos will be returned in the response.

                    So, this stage ensures that you're not getting more videos than you want (it enforces the pagination limit).
                    */
            }
            // GET /api/videos?query=funny&sortBy=views&sortType=-1&page=2&limit=5
        ]

        // 4. run the aggregation and paginate
        const result = await Video.aggregate(aggregateQuery)

         // Use pagination plugin separately (after aggregation)
        const options = { page, limit}
        const paginateResult = Video.aggregatePaginate(result, options)

        return res
        .status(200)
        .json(new ApiResponse(200, paginateResult, "Fetched all videos successfully"))
    } catch (error) {
        console.log("Error while fetching videos", error)
        throw error
        // throw new ApiError(500, "Error in fetching videos")
    }
})


const publishVideo =  asyncHandler(async(req,res) => {
    const { title, description, videoOwner, isPublished = true } = req.body

    if(!title || title?.trim()===""){
        throw new ApiError(400,"Title is missing!")
    }
    if(!description || description?.trim()===""){
        throw new ApiError(400, "Description is missing")
    }
    if(!title && !description && !videoOwner){
        throw new ApiError(400, "Both fields are requires")
    }

    // localPath
    const videoFilePath = req.files?.videoFile?.[0].path
    // const thumbnailFilePath = req.files?.thumbnail?.[0].path 
    let thumbnailFilePath;
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0){
        thumbnailFilePath = req.files?.thumbnail[0].path
    }
    if(!videoFilePath){
        throw new ApiError(400, "Video file won't upload in local file path, means video file is missing..")
    }
    if(!thumbnailFilePath){
        throw new ApiError(400, "Thumbnail is required!")
    }

    // upload on cloudinary
    const videoFile = await uploadOnCloudinary(videoFilePath)
    const thumbnail = await uploadOnCloudinary(thumbnailFilePath)

    if(!videoFile){
        throw new ApiError(500, "Something went wrong while uploading video file on cloudinary :(")
    }


    // store in database
    const video = await Video.create({
        // videoFile: {
        //     public_id: videoFile?.public_id,
        //     url: videoFile?.url
        // },
        // thumbnail: {
        //     public_id: thumbnail?.public_id || "",
        //     url: thumbnail?.url || ""
        // }, Dont take them as a OBJECT {} as in video model is defined as string, so error will come, type error
        videoFile: videoFile?.url,
        thumbnail: thumbnail?.url || "", 
        title,
        description,
        isPublished,
        videoOwner: req.user._id,
        duration: videoFile?.duration
    })
    if(!video){
        throw new ApiError(500,"Something went wrong while uploading video file on database :(")
    }

    // return the response
    return res
    .status(201)
    .json(new ApiResponse(200, video, "video uploaded successfully :)"))
})

const updateVideoDetails = asyncHandler(async(req,res) => {
    const {videoId} = req.params;
    const {title, description} = req.body;
    const thumbnail = req.file?.path;
// 1. Validate video ID
    if(!isValidObjectId(videoId)){
        throw new ApiError(404, "Invalid Video Id")
    }
// 2. Make sure at least one field is provided
    if(!title && !description && !thumbnail){
        throw new ApiError(400, "At least one field (title, description, or thumbnail) is required to update");
    }
  // 3. Find the video
  const video = await Video.findById(videoId)
  if(!video){
    throw new ApiError(400, "Video not found")
  }

  // 5. update fields

    let updateData = {
        $set:{
            title,
            description,
        }
    }
    // const updateData = {};
    // if (title) updateData.title = title;
    // if (description) updateData.description = description;

  // 4. If new thumbnail provided, delete old one and upload new
  if(thumbnail){
    const oldThumbnail = video.thumbnail?.url
    if(oldThumbnail){
        const publicId = oldThumbnail.split("/").pop().split(".")[0]
        await deleteFromCloudinary(publicId)
    }

    const newThumbnail = await uploadOnCloudinary(thumbnail)
    if(!newThumbnail){
        throw new ApiError(400, "Error while uploading new thumbnail to Cloudinary")
    }
    // updateData.thumbnail = {
    //     url: newThumbnail.url,
    //     publicId: newThumbnail.publicId
    // }
    updateData.thumbnail = newThumbnail.url  //This works with your current schema (thumbnail: String)
  }

    // 6. Update the video
    const updatedVideo = await Video.findByIdAndUpdate(videoId,
        updateData,  // already has $set , if we use {updateData} -> mongoDb will create a field rather than updating it..
        {new: true}
    )
    if(!updatedVideo){
        throw new ApiError(400,"Failed to update video details")
    }
    return res
    .status(201)
    .json(new ApiResponse(200, updatedVideo, "Video details updated successfully :)"))
})

const deleteVideo = asyncHandler(async(req,res) => {
    const {videoId} = req.params
   if(!isValidObjectId(videoId)){
    throw new ApiError(404, "This video is not valid")
   }

//    find video in DB
   const video = await Video.findById({
    _id: videoId
   })
   if(!video){
    throw new ApiError(404, "video not found")
   }

//    console.log("video:", video);
//    console.log("req.user:", req.user);

   if(video.videoOwner.toString() !== req.user._id.toString()){
    throw new ApiError(403, "You don't have permission to delete this video!")
   }

   // delete video and thumbnail in cloudinary
   if(video.videoFile){
    const videoPublicId = extractPublicIdFromUrl(video.videoFile.url)
    await deleteFromCloudinary(videoPublicId, "video")  //specify as it, only delete video
   }
   if(video.thumbnail){
    const thumbnailPublicId = extractPublicIdFromUrl(video.thumbnail.url)
    await deleteFromCloudinary(thumbnailPublicId)
   }

   const deleteResponse = await Video.findByIdAndDelete(videoId)

//    return the response
   return res
   .status(201)
   .json(new ApiResponse(200, deleteResponse, "Video deleted successfully"))

})

const isPublishStatus = asyncHandler(async(req, res) => {
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Video Id is not valid")
    }

    const video = await Video.findById({
        _id: videoId
    })
    if(!video){
        throw new ApiError(400, "Video not found")
    }

    if(video.videoOwner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You don't have permission to toggle this video!")
    }

    video.isPublished = !video.isPublished  //true becomes false and vide versa
    await video.save({validateBeforeSave: false})

    return res
    .status(201)
    .json(new ApiResponse(200, video, "Video toggle successfully"))
})

export {getAllVideos,
    getVideoById,
    publishVideo,
    updateVideoDetails,
    deleteVideo,
    isPublishStatus,
}