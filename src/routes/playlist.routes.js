import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoPlaylist, 
    createPlaylist, 
    deletePlaylist, 
    getPlaylistId, 
    getUserPlaylistsId, 
    removeVideoPlaylist,
    updatePlaylist} from "../controllers/playlist.controller.js";


const router = Router();

router.use(verifyJWT);  // Apply verifyJWT middleware to all routes in this file

router.route("/create-playlist").post(createPlaylist)


router.route("/add/:playlistId/:videoId").patch(addVideoPlaylist)
router.route("/remove/:playlistId/:videoId").patch(removeVideoPlaylist)

router.route("/playlistId/:playlistId").get(getPlaylistId)
router.route("/update-playlist/:playlistId").patch(updatePlaylist)
router.route("/delete-playlist/:playlistId").delete(deletePlaylist)

router.route("/user/:userId").get(getUserPlaylistsId)

export default router