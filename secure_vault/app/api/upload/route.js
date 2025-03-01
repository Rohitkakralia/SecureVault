import { NextResponse } from "next/server";
import FormData from "form-data";
import axios from "axios";
import connectDB from "@/db/connectDb";
import mongoose from "mongoose";
import Image from "@/models/Image";
import User from "@/models/User";

export async function POST(req) {
  console.log("Request received");
  await connectDB();
  console.log("DB connected");
  
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const iv = formData.get("iv");
    const userEmail = formData.get("useremail");

    if (!file || !iv || !userEmail) {
      return NextResponse.json({ 
        error: "No file, IV, or userEmail provided" 
      }, { status: 400 });
    }

    // Find the user by email to get their ObjectId
    const user = await mongoose.model('User').findOne({ email: userEmail });
    console.log("User found:", user);
    
    if (!user) {
      console.error("User not found with email:", userEmail);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    console.log("Found user with ID:", user._id);
    console.log("File received:", file.name);
    console.log("IV received:", iv);

    const pinataFormData = new FormData();
    const buffer = Buffer.from(await file.arrayBuffer());

    pinataFormData.append("file", buffer, file.name);
    pinataFormData.append("pinataMetadata", JSON.stringify({ name: file.name }));
    pinataFormData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

    console.log("Uploading encrypted file to Pinata...");

    const pinataResponse = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      pinataFormData,
      {
        headers: {
          ...pinataFormData.getHeaders(),
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
        },
      }
    );

    const ipfsHash = pinataResponse.data.IpfsHash;
    
    // Create and save the image record with the user's ObjectId
    const newImage = new Image({
      user: user._id, // Use the MongoDB ObjectId
      hash: ipfsHash,
      iv: iv,
      fileName: file.name
    });
    
    console.log("Saving image record to database...");
    await newImage.save();
    console.log("Image record saved to database");

    return NextResponse.json({
      hash: ipfsHash,
      iv,
      _id: newImage._id
    }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file: " + error.message }, { status: 500 });
  }
}