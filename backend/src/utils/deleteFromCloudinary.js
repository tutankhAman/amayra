import {v2 as cloudinary} from "cloudinary";

export const deleteFromCloudinary = async(publicId) => {
    try {
        if (!publicId) {
            console.log("No public ID provided for deletion");
            return null;
        }

        console.log("Attempting to delete file with public ID:", publicId)

        const response = await cloudinary.uploader.destroy(publicId);

        console.log("Cloudinary deletion response", response)

        return response
    } catch (error) {
        console.error("Cloudinary deletion error:", error)
        return null;
    }
};

