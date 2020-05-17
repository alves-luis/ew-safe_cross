const mongoose = require('mongoose');
const { v4 : uuidv4 } = require('uuid');
const Schema = mongoose.Schema;

/**
 * Crosswalk Schema
 */
const crosswalkSchema = new Schema(
  {
    uid: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number],
        required: true,
      }
    }
  },
  { timestamps : true }
);

crosswalkSchema.index({ location: '2dsphere' }, { unique: true });

const Crosswalk = mongoose.model('Crosswalk', crosswalkSchema);

module.exports = Crosswalk;
