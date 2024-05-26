import { Request, Response } from "express";
import User from "../models/userModel";
import handle from 'express-async-handler';
import { IRequest } from "./authController";
import factory = require ('./factory');
import AppError from "../util/AppError";

export const getAllUsers = factory.getAll (User);
export const createUser = () => { throw new AppError ('Route not defined. Use /signup instead', 400)}
export const getUser = factory.getOne (User);
export const updateUser = factory.updateOne (User);
export const deleteUser = factory.deleteOne (User);

export const updateMe = handle (async(req:Request, res:Response):Promise<void> =>
{
    let update:{[key:string]:any} = {};

    ['name', 'email', 'photo'].forEach (el => {
        if (req.body.hasOwnProperty (el))
            update[el] = req.body[el];
    })

    const user = await User.findByIdAndUpdate ((req as IRequest).user.id, update, {new:true, runValidators:true});

    res.status (200).json({
        status: 'success',
        data: {
            user
        }
    })

});


export const deleteMe = handle (async(req:Request, res:Response):Promise<void> =>
{
    await User.findByIdAndUpdate ((req as IRequest).user.id, {active:false});

    res.status (204).json ({
        status: 'success',
        data: null
    })
});


export const getMe = function (req:Request, res:Response) : void 
{
    const { user } = req as IRequest;

    res.status (200).json ({
        status: 'success',
        data: {
            user
        }
    })
}