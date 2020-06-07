const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Crosswalks History Schema
 */
const crosswalksHistorySchema = new Schema(
  {
    crosswalk_id: {
      type: String,
      unique: true,
      required: true,
    },
    pedestrian_id: {
      type: String,
      required:true,
    },
    timestamp: {
      type: Date,
      required:true,
    },
  },
  { timestamps: true },
);

const CrosswalksHistory = mongoose.model(
  'CrosswalksHistory',
  crosswalksHistorySchema,
);

module.exports = CrosswalksHistory;
