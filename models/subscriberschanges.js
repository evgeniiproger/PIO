const { Schema, model } = require('mongoose');

const subscribersChanges = new Schema({
  subscriberschanges: {
    nameSubChanged: [
      {
        loginSub: { type: String },
        oldNameSub: { type: String },
        newNameSub: { type: String },
      },
    ],
    loginSubChanged: [
      {
        oldLoginSub: { type: String },
        newLoginSub: { type: String },
        nameSub: { type: String },
      },
    ],
    added: [
      {
        loginSub: { type: String },
        nameSub: { type: String },
      },
    ],
    removed: [
      {
        loginSub: { type: String },
        nameSub: { type: String },
      },
    ],
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  date: { type: Date, default: Date.now },
});

module.exports = model('subscriberschanges', subscribersChanges);
