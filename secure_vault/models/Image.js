import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  hash: { 
    type: String, 
    required: true 
  },
  iv: { 
    type: String 
  },
  fileName: { 
    type: String 
  },
  uploadDate: { 
    type: Date, 
    default: Date.now 
  },
});

export default mongoose.models.Image || mongoose.model('Image', ImageSchema);