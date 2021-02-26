'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

var RouteSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    trim: true,
    required: true
  },
  description: {
    type: String,
    trim: true,
    required: true
  },
  distance: {
    type: Schema.Types.Number,
    required: true
  },
  image_url: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  veichle_types: [{
    type: String, enum: ['motorcycle', 'bike'],
  }],
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  overview_polyline: {
    type: String,
    required: true,
  },
  waypoints: [{
    type: pointSchema,
    index: '2dsphere'
  }]
});

module.exports = mongoose.model('Route', RouteSchema);