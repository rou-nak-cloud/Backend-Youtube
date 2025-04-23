import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config(); // Must be at top if not already done globally
// That file is being imported and executed directly before your server.js (or wherever dotenv.config() lives) has a chance to run.

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // console.log("file is uploading to cloudinary", localFilePath);
        // Uploading the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, 
            {
            resource_type: "auto"
        })
        // console.log(response) 
        
        // file uploaded successfully
        // console.log("file is uploaded at Cloudinary Server", response.url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        // console.error('Cloudinary upload error:', error);
        fs.unlinkSync(localFilePath)
        return null;
        // remove the file from local storage if upload fails due to malicious file or corrupted file
    }
}

// Delete utility
const deleteFromCloudinary = async(publicId) => {
    try {
        if(!publicId) return null;

        const response = await cloudinary.uploader.destroy(publicId)
        return response;
    } catch (error) {
        console.log("Error in detecting from cloudinary", error)
        return null;
    }
}


export { uploadOnCloudinary,
    deleteFromCloudinary
 };