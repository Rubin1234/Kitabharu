var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var logger = require('morgan');
var session = require('express-session');
var app = express();



//For Flash Message
var MemoryStore = require('memorystore')(session)
mongoose.connect('mongodb+srv://rubin123123:rubin123123@cluster0.mcxac.mongodb.net/kitabharu?retryWrites=true&w=majority', {useNewUrlParser: true, useCreateIndex: true,useUnifiedTopology: true});

// app.use(session({
//   secret: 'secret123',
//   saveUninitialized: true,
//   resave: false,
// }));

app.use(session({
  secret: 'secret123',
  saveUninitialized: true,
  store : new MemoryStore({mongooseConnection : mongoose.connection,
    checkPeriod: 86400000}),
  resave: false,
  
})); 



var flash = require('express-flash');
app.use(flash());


app.set('views', [path.join(__dirname, 'views'),
                  path.join(__dirname, 'views/backend/')]);


app.set('view engine', 'ejs');


// --> 11)  Mount the body-parser middleware  here
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
}));



var loginRouter = require('./routes/admin/login');
var usersRouter = require('./routes/admin/users');
var registerRouter = require('./routes/admin/register');
var dashboardRouter = require('./routes/admin/dashboard');
var adminRouter = require('./routes/admin/manageadmin/admin');
var roleRouter = require('./routes/admin/manageadmin/role');
var categoriesRouter = require('./routes/admin/categories/categories');
var subcategoriesRouter = require('./routes/admin/categories/subcategories');
var productRouter = require('./routes/admin/products/product');
var brandRouter = require('./routes/admin/brands/brand');


//Frontend

var homeRouter = require('./routes/frontend/home');
var bookRouter = require('./routes/frontend/books');
var stationaryRouter = require('./routes/frontend/stationary');
var ebookRouter = require('./routes/frontend/ebooks');
var articleRouter = require('./routes/frontend/articles');
var blogRouter = require('./routes/frontend/blogs');
var publicationRouter = require('./routes/frontend/publications');
var videosRouter = require('./routes/frontend/videos');
var contactusRouter = require('./routes/frontend/contactus');
var bookdetailsRouter = require('./routes/frontend/bookdetails');
var stationarydetailsRouter = require('./routes/frontend/stationarydetails');
var articledetailsRouter = require('./routes/frontend/articledetails');
var customerLoginRouter = require('./routes/frontend/login');

//API
var homeApiRouter = require('./routes/api/home');
var signUpApiRouter = require('./routes/api/signup');
var loginApiRouter = require('./routes/api/login');

// view engine setup



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(bodyParser.json({ type: 'application/*+json' }))




app.use('/users', usersRouter);
app.use('/', loginRouter);
app.use('/register', registerRouter);
app.use('/', dashboardRouter);
app.use('/admin', adminRouter);
app.use('/admintype', roleRouter);
app.use('/categories', categoriesRouter);
app.use('/subcategories', subcategoriesRouter);
app.use('/product', productRouter);
app.use('/brand', brandRouter);


// frontend
app.use('/', homeRouter);
app.use('/books', bookRouter);
app.use('/stationary', stationaryRouter);
app.use('/ebooks', ebookRouter);
app.use('/articles', articleRouter);
app.use('/blogs', blogRouter);
app.use('/publications', publicationRouter);
app.use('/videos', videosRouter);
app.use('/contactus', contactusRouter);
app.use('/', bookdetailsRouter);
app.use('/stationarydetails', stationarydetailsRouter);
app.use('/articledetails', articledetailsRouter);
app.use('/customer', customerLoginRouter);



//API
app.use('/api', homeApiRouter);
app.use('/api', signUpApiRouter);
app.use('/api', loginApiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
