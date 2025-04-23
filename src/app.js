import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// console.log("CORS Origin:", process.env.CORS_ORIGIN);

app.use(cors (
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({limit: "16kb", extended: true}))
app.use(express.static("public"))

app.use(cookieParser())

// POSTMAN TEST
app.post("/test", (req, res) => {
    console.log(" TEST endpoint hit");
    console.log("BODY:", req.body);
    res.json({ msg: "Test route hit", body: req.body });
  });
  
// importing routes
import userRoutes from './routes/user.routes.js'
import videoRoutes from './routes/video.routes.js'
import playlistRoutes from './routes/playlist.routes.js'
import subscriptionRoutes from './routes/subscription.routes.js'
import tweetRoutes from './routes/tweet.routes.js'
import commentRoutes from './routes/comment.routes.js'
import likedRoutes from './routes/liked.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import healthCheckRoutes from './routes/healthCheck.routes.js'


// routes declaration
// console.log(' Users route mounted at /api/v1/users');
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/playlist", playlistRoutes);
app.use("/api/v1/subscription",subscriptionRoutes);
app.use("/api/v1/tweet",tweetRoutes);
app.use("/api/v1/comments",commentRoutes);
app.use("/api/v1/liked", likedRoutes);
app.use("/api/v1/dashboard",dashboardRoutes);
app.use("/api/v1/healthCheck",healthCheckRoutes);


// http://localhost:5000/api/v1/users/register

export default app;