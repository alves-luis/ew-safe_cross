const mongoose = require('mongoose');
const { v4 : uuidv4 } = require('uuid');
const Schema = mongoose.Schema;

/**
 * Pedestrian Schema
 */
const pedestrianSchema = new Schema(
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

const Pedestrian = mongoose.model('Pedestrian', pedestrianSchema);

module.exports = Pedestrian;