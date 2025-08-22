import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String },
    country: { type: String },
    passwordHash: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['user', 'admin', 'staff'], 
      default: 'user' 
    },
    profilePicture: {
      url: { type: String },
      deleteUrl: { type: String },
      id: { type: String }
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;


