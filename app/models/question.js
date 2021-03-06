/**
 * Module dependencies.
 */
let mongoose = require('mongoose'),
  config = require('../../config/config'),
  Schema = mongoose.Schema;


/**
 * Question Schema
 */
let QuestionSchema = new Schema({
  id: {
    type: Number
  },
  text: {
    type: String,
    default: '',
    trim: true
  },
  numAnswers: {
    type: Number
  },
  official: {
    type: Boolean
  },
  expansion: {
    type: String,
    default: '',
    trim: true
  },
  location: {
    type: String,
    default: '',
    trim: true,
  }
});

/**
 * Statics
 */
QuestionSchema.statics = {
  load(id, cb) {
        this.findOne({
            id: id
        }).select('-_id').exec(cb);
    }
};

let QuestionModel = mongoose.model('Question', QuestionSchema);

module.exports = QuestionModel;
