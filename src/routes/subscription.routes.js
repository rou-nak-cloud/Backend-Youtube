import {Router} from 'express'
import { getSubscribedChannels, 
    getUserChannelSubscription, 
    toggleSubscription } from '../controllers/subscription.controller.js';
import {verifyJWT} from "../middlewares/auth.middleware.js"
    

const router = Router()
router.use(verifyJWT);  // Apply verifyJWT middleware to all routes in this file

router.route("/sub/:channelId")
            .get(getUserChannelSubscription)
            .post(toggleSubscription)

router.route("/subs/:subscriberId").get(getSubscribedChannels)

export default router