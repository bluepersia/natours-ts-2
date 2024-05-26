import { HydratedDocument, Query, Schema, Types, model } from "mongoose";
import { IUser } from "./userModel";
import Tour from "./tourModel";

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

async function calcRatingsForTour (tourId:Types.ObjectId) : Promise<void>
{
    const stats = await Review.aggregate ([
        {
            $match:{ tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                ratingsAverage: {$avg: '$rating'},
                ratingsQuantity: {$sum: 1}
            }
        }
    ])

    const update = stats.length === 0 ? {ratingsAverage: 4.5, ratingsQuantity:0} : stats[0];

    await Tour.findByIdAndUpdate (tourId, update);
}

reviewSchema.pre (/^(find|findOne)$/, function(next):void
{
    (this as Query<unknown,unknown>).populate ({path:'user', select: 'name photo'});
    next ();
});


reviewSchema.post ('save', async function() : Promise<void>
{
    await calcRatingsForTour (this.tour);
});

reviewSchema.post (/^(findByIdAndUpdate|findByIdAndDelete)$/, async function(doc:HydratedDocument<IReview>):Promise<void>
{
    await calcRatingsForTour (doc.tour); 
});

reviewSchema.index({tour:1, user:1}, {unique:true});


const Review = model ('Review', reviewSchema);


export default Review;