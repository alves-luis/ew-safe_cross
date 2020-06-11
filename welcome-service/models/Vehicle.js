const mongoose = require('mongoose');
const { v4 : uuidv4 } = require('uuid');
const Schema = mongoose.Schema;

/**
 * Vehicle Schema
 */
const vehicleSchema = new Schema(
  {
    uid: {
      type: String,
      default: uuidv4(),
      unique: true,
      required: true
    }
  },
  { timestamps : true }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;