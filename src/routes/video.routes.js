import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo, getAllVideos, 
    getVideoById, 
    isPublishStatus, 
    publishVideo,
     updateVideoDetails } from "../controllers/video.controller.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/video/:videoId").get(getVideoById)
router.route("/fetch-videos").get(getAllVideos)
router.route("/publish-video").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishVideo)

router.route("/update-video-details/:videoId").patch(upload.single("thumbnail"), updateVideoDetails)
router.route("/drop-video/:videoId").delete(deleteVideo)

router.route("/toggle/publish/:videoId").patch(isPublishStatus)


export default router