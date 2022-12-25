const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const bookRouter = require('./routes/bookRoutes');

const app = express();

app.use(express.json());

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//routes 
app.use('/api/v1/books',bookRouter);


app.all('*', (req,res,next)=>{
    next(new AppError(`can't find ${req.originalUrl}`, 404));
});

//middle ware for handling errors
app.use(globalErrorHandler);

module.exports = app;