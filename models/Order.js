const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['in process', 'completed', 'cancelled'],
      default: 'in process',
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user'],
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Order', OrderSchema)