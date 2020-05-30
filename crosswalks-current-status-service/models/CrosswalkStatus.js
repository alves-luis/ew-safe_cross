const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Crosswalk Status Schema
 */
const crosswalkStatusSchema = new Schema(
  {
    uid: {
      type: String,
      unique: true,
      required: true
    },
    light: {
      type: String,
      enum: ['green', 'yellow', 'red'],
      default: 'green'
    },
    num_vehicles: {
      type: Number,
      min: 0,
      default: 0
    },
    num_pedestrians: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  { timestamps : true }
);

const CrosswalkStatus = mongoose.model('CrosswalkStatus', crosswalkStatusSchema);

module.exports = CrosswalkStatus;