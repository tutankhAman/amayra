import { v2 as cloudinary } from "cloudinary"
import { response } from "express";
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_KEY,
    api_Secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        console.log("File uploaded to cloudinary", response.url);
        return response;

    } catch (error) {
        //removing local temporary file if upload gets failed
        fs.unlinkSync(localFilePath);
        return null
    }
}

export {uploadOnCloudinary}
