const { Router } = require('express');
const router = Router();
const Subscribers = require('../models/subscribers');

router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const subscriberDoc = await Subscribers.findOne({ userId }).lean();
    // console.log('subscriberDoc', subscriberDoc);
    const date = subscriberDoc?.date || null;
    // const subscribers = subscriberDoc ? subscriberDoc.subscribers : [];
    const subscribers = subscriberDoc ? subscriberDoc.subscribers : [];

    res.render('subscribers', {
      title: 'Подписчики',
      isSubscribers: true,
      subscribers,
      date,
    });
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
