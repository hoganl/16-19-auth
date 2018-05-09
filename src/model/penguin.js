'use strict';

import mongoose from 'mongoose';

const penguinSchema = mongoose.Schema({
  name: { 
    type: String,
    required: true, 
  },
  species: { type: String },
  colors: { type: String },
  location: { type: String },
  account: {
    type: mongoose.Schema.ObjectId,
    required: true,
    unique: true,
  },
});

export default mongoose.model('penguin', penguinSchema);
