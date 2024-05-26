import { Schema, model } from "mongoose";
import validator from 'validator'
import bcrypt from 'bcryptjs';
import crypto from 'crypto';


export interface IUser 
{
    name:string,
    email:string,
    photo:string,
    role:string,
    active:boolean,
    password:string | undefined,
    passwordConfirm: string | undefined,
    passwordChangedAt:Date,
    passwordResetToken:string | undefined,
    passwordResetExpires:Date | undefined,
    comparePassword: (s:string, hash:string) => Promise<boolean>,
    hasPasswordChangedSince: (date:Date) => boolean,
    createPasswordResetToken: () => string
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
    role: {
        type:String,
        default: 'user',
        enum: ['user', 'guide', 'lead-guide', 'admin']
    },
    active: {
        type:Boolean,
        default:true
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
    },
    passwordChangedAt:Date,
    passwordResetToken: String,
    passwordResetExpires:Date
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

userSchema.methods.hasPasswordChangedSince = function (date:Date) : boolean
{
    return this.passwordChangedAt && this.passwordChangedAt >= date;
}

userSchema.methods.createPasswordResetToken = function () : string 
{
    const token = crypto.randomBytes (32).toString ('hex');

    this.passwordResetToken = crypto.createHash ('sha256').update (token).digest ('hex');
    this.passwordResetExpires = new Date (Date.now() + (7 * 24 * 60 * 60 * 1000));
    
    return token;
}
const User = model ('User', userSchema);


export default User;