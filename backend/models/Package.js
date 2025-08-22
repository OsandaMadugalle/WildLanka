import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true 
    },
    category: { 
      type: String, 
      required: true,
      enum: ['Safari', 'Hiking', 'Photography', 'Birding', 'Adventure']
    },
    duration: { 
      type: String, 
      required: true 
    },
    price: { 
      type: Number, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    features: [{ 
      type: String 
    }],
    highlights: [{ 
      type: String 
    }],
    image: {
      url: { type: String },
      deleteUrl: { type: String },
      id: { type: String }
    },
    isPopular: { 
      type: Boolean, 
      default: false 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    rating: { 
      type: Number, 
      default: 0 
    },
    reviews: { 
      type: Number, 
      default: 0 
    },
    maxGroupSize: { 
      type: Number, 
      default: 10 
    },
    difficulty: { 
      type: String, 
      enum: ['Easy', 'Moderate', 'Challenging'], 
      default: 'Moderate' 
    },
    location: { 
      type: String, 
      required: true 
    },
    included: [{ 
      type: String 
    }],
    notIncluded: [{ 
      type: String 
    }],
    requirements: [{ 
      type: String 
    }],
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    }
  },
  { timestamps: true }
);

const Package = mongoose.model("Package", packageSchema);

export default Package;
