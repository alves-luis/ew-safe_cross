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
    client_id: {
      type: String,
      required:true,
    },
    client: {
      type: String,
      required:true,
    },
    createdAt: {
      type: Date,
      required:true,
    },
  },
  { timestamps: false },
);

const CrosswalksHistory = mongoose.model(
  'CrosswalksHistory',
  crosswalksHistorySchema,
);

module.exports = CrosswalksHistory;
