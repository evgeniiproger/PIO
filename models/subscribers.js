const { Schema, model } = require('mongoose');

const subscribersSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subscribers: [
    {
      loginSub: { type: String },
      nameSub: { type: String },
    },
  ],
  date: { type: Date, default: Date.now },
});

module.exports = model('subscribers', subscribersSchema);
