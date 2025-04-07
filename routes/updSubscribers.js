const { Router } = require('express');
const router = Router();
const Subscribers = require('../models/subscribers');
const Subscriberschanges = require('../models/subscriberschanges');
const { JSDOM } = require('jsdom');

function compareUsers(oldArray, newArray) {
  const oldMap = new Map(oldArray.map((user) => [user.loginSub, user]));
  const newMap = new Map(newArray.map((user) => [user.loginSub, user]));

  // Найти пользователей, изменивших имя (но с тем же логином)
  const nameSubChanged = [];
  for (const user of newArray) {
    if (
      oldMap.has(user.loginSub) &&
      oldMap.get(user.loginSub).nameSub !== user.nameSub
    ) {
      nameSubChanged.push({
        loginSub: user.loginSub,
        oldNameSub: oldMap.get(user.loginSub).nameSub,
        newNameSub: user.nameSub,
      });
    }
  }

  // Найти пользователей, изменивших логин (но с тем же именем)
  const loginSubChanged = [];
  const oldNames = new Map(
    oldArray.map((user) => [user.nameSub, user.loginSub])
  );

  for (const user of newArray) {
    if (!oldMap.has(user.loginSub) && oldNames.has(user.nameSub)) {
      loginSubChanged.push({
        oldLoginSub: oldNames.get(user.nameSub),
        newLoginSub: user.loginSub,
        nameSub: user.nameSub,
      });
    }
  }

  // Удалить из рассмотрения пользователей, уже попавших в nameSubChanged и loginSubChanged
  const processedLogins = new Set([
    ...nameSubChanged.map((u) => u.loginSub),
    ...loginSubChanged.map((u) => u.newLoginSub),
    ...loginSubChanged.map((u) => u.oldLoginSub),
  ]);

  const removed = oldArray.filter(
    (user) => !processedLogins.has(user.loginSub) && !newMap.has(user.loginSub)
  );
  const added = newArray.filter(
    (user) => !processedLogins.has(user.loginSub) && !oldMap.has(user.loginSub)
  );

  return { nameSubChanged, loginSubChanged, added, removed };
}
function parseHtmlToSubscribers(codeSub) {
  const dom = new JSDOM(codeSub);
  const document = dom.window.document;

  const logins = [];
  const divlogins = document.querySelectorAll(
    'div.x1rg5ohu > div > a > div > div > span'
  );
  divlogins.forEach((span, index) => {
    logins.push(span.textContent.trim());
  });
  const names = [];
  const divNames = document.querySelectorAll('span[class*="xuxw1ft"]');
  divNames.forEach((div, index) => {
    names.push(div.textContent.trim());
  });

  const newSubscribers = []; // Массив для хранения пользователей

  if (logins.length === names.length) {
    for (let i = 0; i < logins.length; i++) {
      newSubscribers.push({
        loginSub: logins[i],
        nameSub: names[i],
      });
    }
  } else {
    throw new Error(
      'Длинна массива Юзера и Имёна не совпадает, проверяй что собирает querySelectorAll'
    );
  }
  // console.log(req.user._id);
  return newSubscribers;
}

router.get('/', async (req, res) => {
  // console.log(req.user._id);
  const changes = await Subscriberschanges.find({
    userId: req.user._id,
  })
    .sort({ date: -1 })
    .lean();

  // console.log('changes:', changes);
  res.render('updSubscribers', {
    title: 'Обновление подписчиков',
    isUpdSubscribers: true,
    changes,
  });
});

router.post('/', async (req, res) => {
  //берем старых подписчиков с БД
  let userSubscribersBD = await Subscribers.findOne({
    userId: req.user._id,
  });

  //Если БД пустое создаем экземпляр чтобы было откуда брать подписчиков
  if (!userSubscribersBD) {
    userSubscribersBD = new Subscribers({
      userId: req.user._id,
      subscribers: [],
      date: Date.now,
    });
  }

  //TYZ внизу Тут мы в userS подготовили экземпляр класса с пустым списком подписчиков

  //Формируем массив подписчиков с бд
  const oldSubscribers = userSubscribersBD.subscribers;

  // Парсим вставленный код генерируем новый массив
  const codeKus = req.body.codeSub; //Получаем с поля
  const newSubscribers = parseHtmlToSubscribers(codeKus);
  // console.log('newSubscribers:', newSubscribers);

  //Проверяем были ли изменения? 1)создаём массивы изменений
  const changesAnswers = compareUsers(oldSubscribers, newSubscribers);

  const hasNonEmptyArray = Object.values(changesAnswers).some(
    (arr) => arr.length > 0
  );

  //Если есть изменения в массиве - то
  if (hasNonEmptyArray) {
    //Отделяем подписавшихся
    // console.log(compareUsers(oldSubscribers, newSubscribers));
    const subscriberschanges = new Subscriberschanges({
      userId: req.user._id,
      subscriberschanges: changesAnswers,
      date: Date.now(),
    });

    await subscriberschanges.save();
    //Сохраняем изменения подписчиков
  }

  userSubscribersBD.subscribers = newSubscribers;
  userSubscribersBD.date = Date.now();
  // await subscribers.updateOne({ userId: req.user._id });
  await userSubscribersBD.save();

  //TYZ вверху
  res.redirect('/updSubscribers');
});

module.exports = router;
