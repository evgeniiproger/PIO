const { body } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.registerValidators = [
  body('email')
    .isEmail()
    .withMessage('Введите корректный email')
    .normalizeEmail()
    .custom(async (value, { req }) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject('Такой email уже занят');
        }
      } catch (e) {
        console.log(e);
      }
    }),
  body('password', 'Пароль должен быть минимум 6 символов')
    .isLength({ min: 6, max: 56 })
    .isAlphanumeric()
    .trim(),
  body('confirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Пароли должны совпадать');
      }
      return true;
    })
    .trim(),
  body('name')
    .isLength({ min: 3 })
    .withMessage('Имя должно быть минимум 3 символа')
    .trim(),
];

exports.loginValidators = [
  body('email')
    .isEmail()
    .withMessage('Введите корректный email')
    .normalizeEmail()
    .custom(async (value, { req }) => {
      try {
        const user = await User.findOne({ email: value });
        if (!user) {
          return Promise.reject('Пользователя с таким емейлом не существует');
        }
      } catch (e) {
        console.log(e);
      }
    }),
  body('password', 'Пароль должен быть минимум 6 символов')
    .isLength({ min: 6, max: 56 })
    .isAlphanumeric()
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: req.body.email });
      try {
        const areSame = await bcrypt.compare(value, user.password);
        if (!areSame) {
          return Promise.reject('Неверный пароль');
        }
      } catch (e) {
        console.log(e);
      }
    })
    .trim(),
];
