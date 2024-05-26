import Review from "../models/reviewModel";
import handle from 'express-async-handler';
import factory = require ('./factory');


export const getAllReviews = factory.getAll (Review);
export const createReview = factory.create (Review);
export const getReview = factory.getOne (Review);
export const updateReview = factory.updateOne (Review);
export const deleteReview = factory.deleteOne (Review);

export const isMine = factory.isMine (Review);