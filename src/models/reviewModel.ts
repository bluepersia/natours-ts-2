import { HydratedDocument, Query, Schema, Types, model } from "mongoose";
import { IUser } from "./userModel";


export interface IReview 
{
    review:string,
    rating:number,
    createdAt:Date,
    tour: Types.ObjectId,
    user: HydratedDocument<IUser>
}


const reviewSchema = new Schema<IReview>({
    review: {
        type:String,
        required:[true, 'Review must have text'],
        minlength: [2, 'Review must have more text']
    },
    rating: {
        type:Number,
        required: [true, 'Review must have a rating'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5']
    },
    createdAt: {
        type:Date,
        default:Date.now()
    },
    tour: {
        type: Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
})

reviewSchema.pre (/^(find|findOne)$/, function(next):void
{
    (this as Query<unknown,unknown>).populate ({path:'user', select: 'name photo'});
    next ();
});


const Review = model ('Review', reviewSchema);


export default Review;