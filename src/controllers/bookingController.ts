import { Request, Response } from "express";
import Tour from "../models/tourModel";
import handle from 'express-async-handler';
import AppError from "../util/AppError";
import { IRequest } from "./authController";
import factory = require ('./factory');
import Booking from "../models/bookingModel";
import User from "../models/userModel";
const stripe = require ('stripe')(process.env.STRIPE_SECRET_KEY);

export const getAllBookings = factory.getAll (Booking);
export const createBooking = factory.create(Booking);
export const getBooking = factory.getOne (Booking);
export const updateBooking = factory.updateOne (Booking);
export const deleteBooking = factory.deleteOne (Booking);


export const getMyBookings = handle (async(req:Request, res:Response):Promise<void> =>
{
    const bookings = await Booking.find ({user: (req as IRequest).user.id});

    const tours = await Promise.all (bookings.map (async booking => await Tour.findById(booking.tour)));

    res.status (200).json ({
        status: 'success',
        data: {
            result: tours.length,
            tours
        }
    })

});


export const getStripeCheckoutSession = handle (async(req:Request, res:Response):Promise<void> =>
{
    const tourId = req.params.tourId;
    const tour = await Tour.findById (tourId);

    if (!tour)
        throw new AppError ('No tour with that ID', 404);

    const session = await stripe.checkout.sessions.create ({
        payment_method_types: ['card'],
        success_url: process.env.HOME_URL,
        cancel_url:process.env.HOME_URL,
        customer_email: (req as IRequest).user.email,
        mode: 'payment',
        client_reference_id: tourId,
        line_items: [{
            quantity: 1,
            price_data: {
                currency: 'usd',
                unit_amount: tour.price * 100,
                product_data: {
                    name: tour.name,
                    description: tour.summary,
                    images: [`${req.protocol}://${req.get ('host')}/img/tours/${tour.imageCover}`]
                }
            }
        }]
    })

    res.status (200).json ({
        status: 'success',
        session
    })
});



export const stripeWebhook = function (req:Request, res:Response)
{
    const signature = req.headers['stripe-signature'];

    let event;
    try 
    {
        event = stripe.webhooks.constructEvent (
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET,
        )
    }catch (err) {
        return res.status (400).send (`Webhook error: ${(err as Error).message}`);
    }

    if (event.type === 'checkout.session.completed')
        createBookingCheckout (event.data.object);
}


async function createBookingCheckout (session: {customer_email:string, client_reference_id:string, amount_total:number}) : Promise<void>
{
    const user = await User.findOne ({email: session.customer_email});

    if (!user)
        throw new AppError ('No user with that email', 404);

    await Booking.create ({
        user: user.id,
        tour: session.client_reference_id,
        price: session.amount_total / 100
    })
}