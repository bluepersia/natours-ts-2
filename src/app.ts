import express from 'express';
import tourRouter from './routes/tourRoutes';

const app = express ();

app.use (express.json({limit:'10kb'}));

app.use ('/api/v1/tours', tourRouter);


export default app;