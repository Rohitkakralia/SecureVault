import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema({
    email: { type: String, required: true },
    username: {
        type: String,
    },
    password: {
        type: String,
        // Password should not be required for OAuth providers
        required: function() {
            return this.provider === 'credentials'; // Only require password for credential-based sign-in
        },
    },
    provider: {
        type: String,
        required: true,
        default: 'credentials', // Default provider is 'credentials'
    },
});

export default mongoose.models.User || model('User', userSchema);