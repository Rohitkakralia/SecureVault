import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  uploadTime: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Image || mongoose.model('Image', ImageSchema);