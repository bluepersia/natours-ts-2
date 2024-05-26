import { HydratedDocument, Query, Schema, Types, model } from "mongoose";
import slugify from 'slugify';
import { IUser } from "./userModel";

export interface ITour 
{
    name:string,
    slug:string,
    duration:number,
    maxGroupSize:number,
    difficulty:string,
    ratingsAverage:number,
    ratingsQuantity:number,
    price:number,
    priceDiscount:number,
    summary:string,
    description:string,
    imageCover:string,
    images:string[],
    createdAt:Date,
    startDates:Date[],
    startLocation: {
        type: 'Point',
        coordinates: [number, number],
        address: string,
        description:string
    },
    locations: {
        type: 'Point',
        coordinates: [number, number],
        address: string,
        description:string,
        day:number
    }[],
    guides: Types.ObjectId[] | HydratedDocument<IUser>[]
}


const tourSchema = new Schema<ITour> ({
    name: {
        type:String,
        required:true,
        minlength: 2
    },
    slug: String,
    duration: {
        type:Number,
        required: true
    },
    maxGroupSize: {
        type:Number,
        required:true
    },
    difficulty: {
        type:String,
        required:true,
        enum: ['easy', 'medium', 'difficult']
    },
    ratingsAverage: {
        type:Number,
        default:4.5
    },
    ratingsQuantity: {
        type:Number,
        default: 0
    },
    price: {
        type:Number,
        required:true,
        min:0
    },
    priceDiscount: {
        type:Number,
        validate: {
            validator: function (val:number) : boolean 
            {
                return val < this.price;
            },
            message: 'Discount must be less than price'
        }
    },
    summary: {
        type:String,
        required:true
    },
    description: String,
    imageCover: {
        type:String,
        required:true
    },
    images: [String],
    createdAt: Date,
    startDates: [Date],
    startLocation: {
        type: {
            type:String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address:String,
        description:String
    },
    locations: [{
        type: {
            type:String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address:String,
        description:String,
        day:Number
    }],
    guides: [{
        type: Schema.ObjectId,
        ref: 'User'
    }]
})

tourSchema.pre (/^findOne$/, function(next):void
{
    (this as Query<unknown, unknown>).populate ({path: 'guides', select: 'name role photo'})
    next();
});

tourSchema.pre ('save', function (next):void
{
    this.slug = slugify (this.name, {lower:true});
    next ();
});


const Tour = model ('Tour', tourSchema);


export default Tour;