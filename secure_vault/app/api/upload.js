import formidable from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import mongoose from 'mongoose';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    const form = formidable({
      uploadDir: uploadsDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file[0];
    const { username, userEmail } = fields;

    // Generate public URL for the file
    const fileName = file.newFilename;
    const imageUrl = `/uploads/${fileName}`;

    // Here you would typically save the metadata to MongoDB
    // const newImage = new Image({
    //   username,
    //   userEmail,
    //   imageUrl,
    //   fileName,
    // });
    // await newImage.save();

    res.status(200).json({
      message: 'Upload successful',
      url: imageUrl,
      username,
      userEmail,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: `Error uploading file: ${error.message}` });
  }
}