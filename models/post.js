const mongoose = require('mongoose');
const { DateTime } = require('luxon')

const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    title: {type: String, required: true},
    date: {type: Date, required: true},
    content: {type: String, required: true},
    tags: [{type: Schema.Types.ObjectId, ref: 'Tag'}]
  }
);

// Virtual for post's URL
PostSchema
.virtual('url')
.get(function () {
  return '/' + this._id;
});

// Virtual for formatted date.
PostSchema
.virtual('formatted_date')
.get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});


//Export model
module.exports = mongoose.model('Post', PostSchema);
