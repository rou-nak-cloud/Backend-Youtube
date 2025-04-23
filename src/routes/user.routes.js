import {Router} from 'express';
import { changeCurrentPassword, 
    getCurrentUser,
     getUserChannelProfile,
      getUserWatchHistory,
      loginUser,
       logoutUser,
        refreshAccessToken,
         registerUser,
          updateAccountDetails, 
          updateUserAvatar,
          updateUserCoverImage} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import  {verifyJWT}  from '../middlewares/auth.middleware.js';


const router = Router()

// console.log("User Router is working");
// http://localhost:5000/api/v1/users/register

//  router.route("/register").post((req, res) => {
    //     console.log("✅ Hit register route");
    //     res.json({ msg: "Register route hit!" });
    //   });
    
    router.route("/register").post(
        upload.fields([
            {
                name: "avatar",
                maxCount: 1
            },
            {
                name: "coverImage",
                maxCount: 1
            }
        ]),
        registerUser)
    router.route("/login").post(loginUser)

    // Secured routes

    router.route("/logout").post(verifyJWT, logoutUser)
    // verifyJWT is a middleware that checks if the user is logged in or not. If not, it will throw an error. If the user is logged in, it will call the logoutUser function.
    router.route("/refresh-token").post(refreshAccessToken)
    router.route("/change-password").post(verifyJWT, changeCurrentPassword)
    router.route("/current-user").get(verifyJWT, getCurrentUser)

    router.route("/update-account").patch(verifyJWT, updateAccountDetails)
    router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
    router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

    router.route("/channel/:username").get(verifyJWT, getUserChannelProfile)
    // Body: Not required (unless your controller uses req.body — but yours uses req.params)
    router.route("/history").get(verifyJWT, getUserWatchHistory)

export default router