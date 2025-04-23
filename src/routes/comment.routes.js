import { Router } from "express";
import { addComment, 
    addCommentToTweet, 
    deleteCommentToTweet, 
    deleteCommentToVideo, 
    getTweetComments,
     geyVideoComments, 
     updateCommentToTweet, 
     updateCommentToVideo } 
     from "../controllers/comments.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT);


router.route("/videoC/:videoId")
            .get(geyVideoComments)
            .post(addComment)

 router.route("/video/c/:commentId")
            .patch(updateCommentToVideo)
            .delete(deleteCommentToVideo)

            
router.route("/tweetC/:tweetId")
            .get(getTweetComments)
            .post(addCommentToTweet)

router.route("/tweet/c/:commentId")
            .patch(updateCommentToTweet)
            .delete(deleteCommentToTweet)

export default router