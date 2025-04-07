const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const session = require('express-session');
const csrf = require('csurf');
const flash = require('connect-flash');
const MongoStore = require('connect-mongodb-session')(session);
const homeRoutes = require('./routes/home');
const authRoutes = require('./routes/auth');
const subscribersRoutes = require('./routes/subscribers');
const updSubscribersRoutes = require('./routes/updSubscribers');
const varMiddleware = require('./middleware/varriables');
const userMiddleware = require('./middleware/user');
const keys = require('./keys');

const app = express();

const hbs = exphbs.create({
  defaultLayout: 'main', //Это основной hbs в папке layouts
  extname: 'hbs',
  helpers: require('./utils/hbs-helpers'),
});

const store = MongoStore({
  collection: 'sessions',
  uri: keys.MONGODB_URI,
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(
  session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
  })
);
app.use(csrf());
app.use(flash());
app.use(varMiddleware);
app.use(userMiddleware);

app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/subscribers', subscribersRoutes);
app.use('/updSubscribers', updSubscribersRoutes);

const PORT = process.env.PORT || 3003;

async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI);
    app.listen(PORT, '0.0.0.0', () =>
      console.log(`Server is running on port ${PORT} `)
    );
  } catch (e) {
    console.log(e);
  }
}

start();
