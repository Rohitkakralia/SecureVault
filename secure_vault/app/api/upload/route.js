
import { NextResponse } from "next/server";
import FormData from "form-data";
import axios from "axios";

export async function POST(req) {
  console.log("Request received Rohit");
  
  try {
    // Parse the request as FormData
    const formData = await req.formData();
    const file = formData.get("file");

    console.log("File received..:", file);
    console.log("form received..:", formData);
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    
    console.log("File received..:", file.name);
    
    // Create a new FormData for Pinata
    const pinataFormData = new FormData();

    console.log("File received..:", pinataFormData);
    
    // Convert the file to a Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Add the file to FormData
    pinataFormData.append("file", buffer, file.name);
    
    console.log("File received..:", pinataFormData);
    // Add metadata
    const pinataMetadata = JSON.stringify({ name: file.name });
    pinataFormData.append("pinataMetadata", pinataMetadata);
    
    console.log("File received..:", pinataMetadata);


    const pinataOptions = JSON.stringify({ cidVersion: 1 });
    pinataFormData.append("pinataOptions", pinataOptions);
    
    console.log("Uploading file to Pinata...");
    
    // Send to Pinata
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
    
    return NextResponse.json({ hash: pinataResponse.data.IpfsHash }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file: " + error.message }, { status: 500 });
  }
}