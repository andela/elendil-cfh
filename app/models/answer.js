/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../../config/config'),
    Schema = mongoose.Schema;

/**
 * Answer Schema
 */
var AnswerSchema = new Schema({
    id: {
        type: Number
    },
    text: {
        type: String,
        default: '',
        trim: true
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
    }
});

/**
 * Statics
 */
AnswerSchema.statics = {
    load: function(id, cb) {
        this.findOne({
            id: id
        }).select('-_id').exec(cb);
    }
};

var AnswerModel = mongoose.model('Answer', AnswerSchema);

module.exports = AnswerModel;
