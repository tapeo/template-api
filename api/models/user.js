'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  tokens: [{
    token: String,
    device: String,
  }],
  routes: [{ type: Schema.Types.ObjectId, ref: 'Route' }]
});

UserSchema.methods.comparePassword = function (psw) {
  return bcrypt.compareSync(psw, this.password);
};

module.exports = mongoose.model('User', UserSchema);

