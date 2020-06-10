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
    history: [{
      client: {
        id:{
          type: String,
          required:true,
        },
        kind:{
          type: String,
          required:true,
        },
      },
      crossedAt:{
        type: Date,
        required:true,
      },
    }],
  },
  { timestamps: false },
);

const CrosswalksHistory = mongoose.model(
  'CrosswalksHistory',
  crosswalksHistorySchema,
);

module.exports = CrosswalksHistory;
