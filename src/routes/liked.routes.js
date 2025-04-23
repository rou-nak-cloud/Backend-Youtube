import { Router } from "express";
import { getLikedVideos, 
    toggleCommentLikeAndUnlike, 
    toggleLikeAndUnlikeVideo, 
    toggleTweetLikeAndUnlike } from "../controllers/liked.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT);

router.route("/toggle/v/:videoId").post(toggleLikeAndUnlikeVideo)
router.route("/toggle/c/:commentId").post(toggleCommentLikeAndUnlike)
router.route("/toggle/t/:tweetId").post(toggleTweetLikeAndUnlike)

router.route("/videos").get(getLikedVideos)

export default router