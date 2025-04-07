const { Schema, model } = require('mongoose');
const { JSDOM } = require('jsdom');

const userSchema = new Schema({
  email: { type: String, required: true },
  name: String,
  password: { type: String, required: true },
  resetToken: String,
  resetTokenExp: Date,
});

userSchema.methods.updSubscribers = function (newSubscribers) {
  this.subscribers = newSubscribers;
  return this.save();
};

userSchema.methods.removeFromCart = function (id) {
  let items = [...this.card.items];
  const idx = items.findIndex((c) => c.courseId.toString() === id.toString());

  if (items[idx].count === 1) {
    items = items.filter((c) => c.courseId.toString() !== id.toString());
  } else {
    items[idx].count--;
  }

  this.card = { items };
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.card = { items: [] };
  return this.save();
};

module.exports = model('User', userSchema);
