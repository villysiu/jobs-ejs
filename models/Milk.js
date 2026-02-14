const mongoose = require('mongoose')

const MilkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Milk name required'],
      unique: true,
    },
    price: {
      type: Number,
      default: 0.0
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Milk', MilkSchema)