import { Schema, model } from "mongoose";
import validator from 'validator'
import bcrypt from 'bcryptjs';


export interface IUser 
{
    name:string,
    email:string,
    photo:string,
    role:string,
    password:string | undefined,
    passwordConfirm: string | undefined,
    passwordChangedAt:Date,
    comparePassword: (s:string, hash:string) => Promise<boolean>
}


const userSchema = new Schema<IUser> ({
    name: {
        type:String,
        required: [true, 'Please provide a name'],
        minlength: 2,
        validate: {
            validator: function (val:string) : boolean
            {
                const split = val.split (' ');

                if (split.length < 2)
                    return false;

                const regEx = /^[a-zA-Z]$/g;
               
                if (!regEx.test (split[0]))
                    return false;

                if (!regEx.test (split[1]))
                    return false;
            
                return true;
            },
            message: 'Please provide your full name (first and last)'
        }
    },
    email: {
        type:String,
        required: [true, 'Please provide an email address'],
        validate: [validator.isEmail, 'Please provide a valid email address']
    },
    photo: {
        type:String,
        default: 'default.jpg'
    },
    password: {
        type:String,
        required:[true, 'Please provide a password'],
        minlength:8,
        select:false
    },
    passwordConfirm: {
        type:String,
        required:[true, 'Please confirm your password'],
        validate: {
            validator: function (val:string) : boolean
            {
                return val === this.password;
            },
            message: 'Passwords must match!'
        }
    }
})

userSchema.pre ('save', async function (next) : Promise<void>
{
    if (this.isModified ('name'))
    {
        const fullName = this.name.split (' ');
        fullName[0] = fullName[0][0].toUpperCase () + fullName[0].toLowerCase().slice (1);
        fullName[1] = fullName[1][0].toUpperCase () + fullName[1].toLowerCase().slice (1);

        this.name = fullName.join (' ');
    }

    if (this.isModified ('password'))
    {
        this.password = await bcrypt.hash (this.password!, 12);

        if (!this.isNew)
            this.passwordChangedAt = new Date (Date.now () - 1000);
    }

    this.passwordConfirm = undefined;
});


userSchema.methods.comparePassword = async function (s:string, hash:string) : Promise<boolean>
{
    return await bcrypt.compare (s, hash);
}

const User = model ('User', userSchema);


export default User;