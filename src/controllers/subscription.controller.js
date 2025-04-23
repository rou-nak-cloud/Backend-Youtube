import mongoose, {isValidObjectId} from 'mongoose'
import { Subscription } from '../models/subscription.model.js'
import { User } from '../models/user.model.js'
import { asyncHandler } from '../utilities/asyncHandler.js'
import { ApiError } from '../utilities/ApiError.js'
import { ApiResponse } from '../utilities/ApiResponse.js'


// toggle subscription
const toggleSubscription = asyncHandler(async(req,res) => {
    const { channelId } = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Channel not found")
    }

    const channel = await User.findById(
        {
            _id: channelId
        }
    )
    if(!channel){
        throw new ApiError(400, "This channel does not exist")
    }


    let subscribe;
    let unsubscribe;

    const itHasSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })
    
    if(itHasSubscription){
        // unsubscribe
            unsubscribe = await Subscription.findOneAndDelete({
            subscriber: req.user._id,
            channel: channelId
        })
        if(!unsubscribe){
            throw new ApiError(500,"Something went wrong while unsubscribing!!")
        }
        // return response
        return res
        .status(200)
        .json(new ApiResponse(
            201, unsubscribe, "Channel unsubscribed successfully"
        ))
    } else {
        // subscribe
            subscribe = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })
        if(!subscribe){
            throw new ApiError(500,"Something went wrong while subscribing!!")
        }
        // return response
        return res
        .status(200)
        .json(new ApiResponse(201, subscribe, "Channel subscribed successfully!!"))
    }
})

const getUserChannelSubscription = asyncHandler(async(req,res) => {
    const { channelId } = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Channel not found")
    }

    // Subscription aggregate
    const subscriptions = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId?.trim())
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails"
            }
        },
        {
            $unwind: "$subscriberDetails"
            // $unwind flattens the array returned by $lookup, turning it into a single object so you can easily project or manipulate its fields.
            // If you don’t use $unwind, then to access subscriberDetails.username, you'd need array syntax (subscriberDetails[0].username), which MongoDB aggregation doesn't support.
        },
        {
            $project: {
                _id: 0,
                fullName: "$subscriberDetails.fullName",
                username: "$subscriberDetails.username",
                avatar: "$subscriberDetails.avatar"
                // In your aggregation pipeline, after $lookup, those fields (username: 1, fullName: 1) are not on the top level — they're inside the array subscriberDetails.

                // username: 1 ➜ only works if username is on the top-level of the current aggregation stage.
                // In your case, after $lookup, those fields are nested.
            }
        }
    ])
    return res.status(200).json(
        new ApiResponse(200, subscriptions, "Subscriber details fetched successfully")
    )
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "This subscriber id is not valid");
    }

    const subscriptions = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannel"
            }
        },
        {
            $unwind: "$subscribedChannel"
        },
        {
            $project: {
                username: "$subscribedChannel.username",
                fullName: "$subscribedChannel.fullName",
                avatar: "$subscribedChannel.avatar"
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, subscriptions, "All Subscribed channels fetched successfully!")
    );
});


export { toggleSubscription,
    getUserChannelSubscription,
    getSubscribedChannels,
}