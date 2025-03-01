"use server"
import mongoose from "mongoose";
import connectDB from "@/db/connectDb";
import User from "@/models/User";
import Image from "@/models/Image";

export const fetchUser = async (useremail) => {
    await connectDB();
    console.log("Fetching user:", useremail);
    let u = await User.findOne({email: useremail});
    let userId = u._id;
    return userId.toString();
}


export const fetchUploads = async (userId) => {
    await connectDB();
    console.log("Fetching uploads for user:", userId);
    try {
        const images = await Image.find({ user: userId })
            .sort({ uploadDate: -1 })
            .lean(); // Convert Mongoose documents to plain objects

        return images.map(image => ({
            ...image,
            _id: image._id.toString(), // Convert ObjectId to string
            user: image.user.toString(), // Convert ObjectId to string if needed
            uploadDate: image.uploadDate.toISOString() // Convert Date to string
        }));
    } catch (error) {
        console.error("Error fetching images:", error);
        return [];
    }
};
