import { Request, Response } from "express";
import AppError from "../util/AppError";

export default function globalErrorHandler (err:Error, req:Request, res:Response, next:() => void) : void 
{
    if (process.env.NODE_ENV === 'production')
    {
        //Unhandled errors
        if (err.name === 'CastError')
            err = handleCastErrorDb (err as CastError);
        else if (err.hasOwnProperty ('code') && (err as CodeError).code === 11000)
            err = handleDuplicateErrorDb (err as DuplicateError);
        else if (err.name === 'ValidationError')
            err = new AppError (err.message, 400);
    }

    let status = 'error';
    let statusCode = 500;
    let message = "Something went wrong."
    if (err instanceof AppError)
    {
        const appError = err as AppError;
        status = appError.status;
        statusCode = appError.statusCode;
        message = appError.message;
    }

    res.status (statusCode);

    if (process.env.NODE_ENV=== 'development')
    {
        res.json ({
            status,
            message:err.message,
            err,
            stack: err.stack
        })
        return;
    }

    res.json ({
        status,
        message
    })
}



interface CastError extends Error
{
    path:string,
    value:string
}

function handleCastErrorDb ({path, value}: CastError) : AppError
{
    return new AppError (`Invalid ${path}:${value}`, 400);
}


interface CodeError extends Error 
{
    code:number
}

interface DuplicateError extends Error
{
    keyValue: {
        [key:string]: any
    }
}

function handleDuplicateErrorDb ({keyValue}:DuplicateError) : AppError
{
    const [key, value] = Object.entries (keyValue)[0];
    return new AppError (`Duplicate ${key}: ${value}.`, 400);
}