import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = async (
    fileBuffer: Buffer
): Promise<string> => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder: "inventory-saas",
                },
                (error, result) => {
                    if (error) return reject(error);

                    resolve(result?.secure_url || "");
                }
            )
            .end(fileBuffer);
    });
};