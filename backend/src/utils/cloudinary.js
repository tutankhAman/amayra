import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.log("No local file path provided");
            return null
        }

        console.log("Attempting to upload file:", localFilePath);

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        console.log("File uploaded to cloudinary",{
            url:  response.url,
            publicId: response.public_id
        });

        fs.unlinkSync(localFilePath)
        return {
            url: response.url,
            publicId: response.public_id
        };

    } catch (error) {
        console.error("Cloudinary upload error:", error);

        // Try to remove the local file even if upload fails
        try {
            fs.unlinkSync(localFilePath);
        } catch (unlinkError) {
            console.error("Error removing local file:", unlinkError);
        }

        return null;
    }
}

export {uploadOnCloudinary}
