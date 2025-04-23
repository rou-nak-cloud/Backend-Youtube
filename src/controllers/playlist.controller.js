import { ApiError } from "../utilities/ApiError.js";
import { ApiResponse } from "../utilities/ApiResponse.js";
import { asyncHandler } from "../utilities/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import mongoose, {isValidObjectId} from "mongoose";

const createPlaylist = asyncHandler(async(req,res) => {
    const {name, description} = req.body
    
    if((!name || name.trim()=== "") && (!description || description.trim()=== "")){
        throw new ApiError(404, "Both name and description is required")
    }

    // creating playlist
    const playlist = await Playlist.create({
        name, 
        description,
        owner: req.user._id
    })
    if(!playlist){
        throw new ApiError(500, "Something went wrong while creating the playlist")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(200, playlist, "Playlist created successfully")
    )
})

const getUserPlaylistsId = asyncHandler(async(req,res) => {
    // get user playlists by userId
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "This user is not valid")
    }

     // find user in database 
    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(404, "User not found")
    }

     // match and find all playlist
     const playlist = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",  // name of the videos collection
                localField: "video", // field in Playlist model (assuming it's a reference ID)
                foreignField: "_id", // match it with the _id field in videos
                as: "videos"  // place matched video(s) in an array field called 'videos'
            }   
        },
        {
            $addFields: {
                playlist: {
                    $first: "$videos"
                }
            }
        }
     ])

     if(!playlist){
        throw new ApiError(500,"Something went wrong while fetching playlist")
     }

     return res
     .status(201)
     .json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
     )

})

const getPlaylistId = asyncHandler(async(req,res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "playlist not found!!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201, playlist, "Playlist fetched successfully")
    )
})

const addVideoPlaylist = asyncHandler(async(req,res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId){
        throw new ApiError(400, "playlistId is not valid")
    }
    if(!videoId){
        throw new ApiError(400, "VideoId is not valid")
    }

    // find playlist in db
    const playlist = await Playlist.findById(playlistId)
    // console.log(playlist)
    if(!playlist){
        throw new ApiError(400,"No playlist found")
    }
    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You don't have permission to add video in playlist")
    }

    // find video in the db of playlist
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "No video found")
    }

    // find if the video already present
    if(playlist.videos.includes(videoId)){
        throw new ApiError(400, "video already existed")
    }

    // add the video in video field of playlist
    const addedVideo = await Playlist.findByIdAndUpdate(playlistId,
        {
            $push: {
                videos: videoId
            }
        },
        {
            new: true
        }
    )
    if(!addedVideo){
        throw new ApiError(500, "something went wrong while added video to playlist !!")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(200, addedVideo, "Video added successfully in the playlist :)")
    )

})

const removeVideoPlaylist = asyncHandler(async(req, res) => {
    const {playlistId, videoId} = req.params

    if(!videoId){
        throw new ApiError(400, "videoId not valid")
    }
    if(!playlistId){
        throw new ApiError(400, "playlistUd not valid")
    }

    const playlist = await Playlist.findById(playlistId)
     if(!playlist){
        throw new ApiError(400,"No playlist found")
    }
    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(404, "You don't have permission to remove the video!!") 
    }

    const video = await Video.findById(videoId)
     if(!video){
        throw new ApiError(400, "No video found")
    }
      // if video exists or not in playlist 
    if(!playlist.videos.includes(videoId)){
        throw new ApiError(400, "Video doesn't exist in the playlist!!")
    }
    // remove video in the playlist 
    const removeVideo = await Playlist.findByIdAndUpdate(playlistId,
        {
            $pull: {
                videos: videoId
            }
        },
        {
            new: true
        }
    )
      if(!removeVideo){
        throw new ApiError(500, "something went wrong while removed video to playlist !!");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201, removeVideo, "Video removed Successfully from the playlist")
    )

})


const updatePlaylist = asyncHandler(async(req,res) => {
    const {playlistId} = req.params
    const {NewName, NewDescription} = req.body

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Playlist id is not valid")
    }
    if((!NewName || NewName?.trim()=== "") || (!NewDescription || NewDescription?.trim()=== "")){
        throw new ApiError(400, "Either name or description is required")
    }

    const playlist = await Playlist.findById(playlistId)
    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You don't have permission to update the playlist!!")
    }
    const updatePlaylist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $set: {
                name: NewName,
                description: NewDescription
            }
        },
        {
            new: true
        }
    )
    if(!updatePlaylist){
        throw new ApiError(500, "Something went wrong while updating the playlist")
    }
    return res
    .status(201)
    .json(
        new ApiResponse(200, updatePlaylist, "Updated playlist successfully :)")
    )
})

const deletePlaylist = asyncHandler(async(req,res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Playlist not found")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,"playlist not found")
    }
    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You don't have permission to delete the video")
    }

    // delete the playlist
    const deletePlaylist = await Playlist.deleteOne(
        {
            _id: playlistId
        }
    )
    if(!deletePlaylist){
        throw new ApiError(500, "Something went wrong while deleting playlist")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(200, deletePlaylist, "Playlist deleted successfully :)")
    )
})


export {
    createPlaylist,
    getUserPlaylistsId,
    getPlaylistId,
    addVideoPlaylist,
    removeVideoPlaylist,
    deletePlaylist,
    updatePlaylist,
}