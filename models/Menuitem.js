const mongoose = require('mongoose');

const MenuitemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },

    active: {
      type: Boolean,
      default: true,
    },

    imageUrl: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      default: 0.0,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },


    milk: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milk',
      required: [true, 'Milk is required'],
    },

    temperature: {
      type: String,
      enum: ['NA', 'HOT', 'ICED'], 
      default: 'HOT', // no choice, ie lemonade
      required: [true, 'Temperature is required'],
    },

    sugar: {
      type: String,
      enum: ['NA', '0%', '25%', '50%','75%', '100%'], 
      default: '0%',
      required: [true, 'Sugar is required'],
    },

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Menuitem', MenuitemSchema);
