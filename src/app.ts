import express from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
const xss = require ('xss-clean');
import hpp from 'hpp';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookies from 'cookie-parser';
import tourRouter from './routes/tourRoutes';
import userRouter from './routes/userRoutes';
import globalErrorHandler from './controllers/errorController';
import AppError from './util/AppError';

const app = express ();

app.use (helmet ());
app.use (mongoSanitize ());
app.use (xss());
app.use (hpp({whitelist:['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']}));

app.use (compression ());

app.use (express.static (`./public`, {
    setHeaders: res => res.setHeader ('Cross-Origin-Resource-Policy', 'cross-origin')
}));

app.use (rateLimit ({windowMs: 5000, max:5, message: 'Rate limit exceeded.'}));

app.use (cookies ());

app.use (express.json({limit:'10kb'}));

app.use ('/api/v1/tours', tourRouter);
app.use ('/api/v1/users', userRouter);

app.all ('*', () => {throw new AppError ('Route not found!', 404)});

app.use (globalErrorHandler);

export default app;