const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const bookRouter = require('./routes/bookRoutes');
const authorRouter = require('./routes/authorRoutes');
const readerRouter = require('./routes/readerRoutes');
const genreRouter = require('./routes/genreRoutes');
const statisticRouter = require('./routes/statisticRoutes');
const recommendationRouter = require('./routes/recommendationRoutes');
const avatarRouter = require('./routes/avatarRoutes');

const app = express();

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//routes 
app.use('/api/v1/books',bookRouter);
app.use('/api/v1/readers',readerRouter);
app.use('/api/v1/authors',authorRouter);
app.use('/api/v1/genres',genreRouter);
app.use('/api/v1/statistics',statisticRouter);
app.use('/api/v1/recommendations',recommendationRouter);
app.use('/api/v1/avatars',avatarRouter);


app.all('*', (req,res,next)=>{
    next(new AppError(`can't find ${req.originalUrl}`, 404));
});

//middle ware for handling errors
app.use(globalErrorHandler);

module.exports = app;