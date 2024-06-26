import { HydratedDocument, Query, Schema, Types, model } from "mongoose";
import { ITour } from "./tourModel";
import { IUser } from "./userModel";


export interface IBooking 
{
    tour:HydratedDocument<ITour>,
    user: HydratedDocument<IUser>,
    price:number,
    createdAt:Date,
    paid:boolean
}

const bookingSchema = new Schema<IBooking> ({
    tour: 
    {
        type:Schema.ObjectId,
        ref: 'Tour',
        required:true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required:true
    },
    price: {
        type:Number,
        required:true
    },
    createdAt: {
        type:Date,
        default:Date.now()
    },
    paid: {
        type:Boolean,
        default:true
    }
});

bookingSchema.pre (/^find/, function(next):void
{
    (this as Query<unknown, unknown>).populate ('user').populate ('tour');
    next ();
});


const Booking = model ('Booking', bookingSchema);


export default Booking;