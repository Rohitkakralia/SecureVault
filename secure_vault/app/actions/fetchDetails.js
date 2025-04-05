"use server"
import mongoose from "mongoose";
import connectDB from "@/db/connectDb";
import User from "@/models/User";
import Image from "@/models/Image";

export async function fetchUser(useremail) {
    await connectDB();
    console.log("Fetching user:", useremail);
    
    // Find the user
    const user = await User.findOne({email: useremail});
    
    // Check if user exists before accessing properties
    if (!user) {
        return null;
    }
    
    // Convert the user document to a plain JavaScript object
    const userObj = user.toObject ? user.toObject() : JSON.parse(JSON.stringify(user));
    
    // Now you can safely access the ID
    return userObj._id.toString();
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

export const fetchImageDetails = async (imageId) => {
    await connectDB();
    console.log("Fetching image details for ID:", imageId);
    try {
        const image = await Image.findById(imageId).lean(); // Convert Mongoose document to plain object

        if (!image) {
            console.error("Image not found with ID:", imageId);
            return null;
        }

        return {
            ...image,
            _id: image._id.toString(), // Convert ObjectId to string
            user: image.user.toString(), // Convert ObjectId to string if needed
            iv: image.iv.toString(), // Convert ObjectId to string if needed
            fileName: image.fileName.toString(), // Convert ObjectId to string if needed
            uploadDate: image.uploadDate.toISOString(), // Convert Date to string
            uploadDate: image.uploadDate.toISOString() // Convert Date to string
        };
    } catch (error) {
        console.error("Error fetching image details:", error);
        return null;
    }
}
