# 🎬 Backend YouTube Clone (Node.js + MongoDB)

A Robust and scalable YouTube-like backend server built with **Node.js**, **Express**, and **MongoDB**, featuring user authentication, video upload, playlist handling, subscription management,
likes/comments, and more.

## Summary of this project:
This project is a complex backend project that is built with nodejs, expressjs, mongodb, mongoose, jwt, bcrypt, and many more. This project is a complete backend project that has all the features
that a backend project should have. 
We are building a complete video hosting website similar to youtube with all the features like login, signup, upload video, like, dislike, comment, reply, subscribe, unsubscribe, and many more.
Project uses all standard practices like JWT, bcrypt, access tokens, refresh Tokens and many more. We have spent a lot of time in building this project and we are sure that you will learn a lot from this project.

![Visual READ.ME](https://github.com/rou-nak-cloud/Backend-Youtube/blob/main/bf20fa55-d6c8-42d8-b293-289316ebebe9.png)

## Model
> 🚀 Built with real-world YouTube features in mind.  
> 🧠 Visual architecture available on [Eraser.io](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)


## 📬 Postman Collection

> 🧪 Test all the API endpoints  
[Postman Collection Link](https://api.postman.com/collections/40021293-8bb8dab5-69ee-4771-a242-e70c3a585a45?access_key=PMAT-01JSGA5CXYV3DTDK8D6V00F3Q5)
---

## 📁 Project Structure

Backend-Youtube/ ├── src/ │ ├── controllers/ │ ├── models/ │ ├── routes/ │ ├── middlewares/ │ ├── utils/ │ ├── config/ │ └── index.js ├── uploads/ ├── .env ├── package.json └── README.md


## 🚀 Features

- ✅ User authentication (signup, login, logout)
- 📹 Upload videos to Cloudinary
- ❤️ Like/dislike system for videos, comments, and tweets
- 💬 Commenting on videos and tweets
- 📁 Playlist management (create, delete, fetch)
- 👥 Subscribe/unsubscribe to channels
- 📊 Channel stats: total videos, views, likes, and subscribers
- 🔎 Search and explore videos
- 📂 RESTful API routes with clean architecture
---


## 🔐 Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **JWT** for authentication
- **Cloudinary** for video/image storage
- **Multer** for handling uploads
- **Eraser.io** for backend flow modeling
- **Postman** for API testing

---

## 🏁 Getting Started

### 🔧 Prerequisites

- Node.js (v18+)
- MongoDB Atlas or Local Instance
- Cloudinary Account (for media upload)

### 📥 Clone the repo

```bash
git clone https://github.com/rou-nak-cloud/Backend-Youtube.git

# Navigate into the directory
cd Backend-Youtube

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env  # Then fill in your values

# Start the server
npm run dev

```

### ⚙️ Environment Setup
```bash
Create a .env file in the root and add the following:

PORT=8000
MONGODB_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ACCESS_TOKEN_SECRET=your_jwt_access_token_secret
REFRESH_TOKEN_SECRET=your_jwt_refresh_token_secret
```


### For full routes, refer to the /routes/ directory.

🔗 Click here to view the project diagram on Eraser
[Model Link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)
Includes visual flow of auth, upload, playlists, and DB schema.

🙌 Author
Rounak Bakshi
GitHub: [rou-nak-cloud]




