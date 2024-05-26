const nodemailer = require ('nodemailer');
import fs from 'fs';
const Styliner = require ('styliner');
const styliner = new Styliner (__dirname + '/html');
import htmlToText from 'html-to-text';

export default class Email
{
    constructor (public to:string, public data:{[key:string]:any}) {}

    newTransport () 
    {
        if (process.env.NODE_ENV === 'development')
            return nodemailer.createTransport ({
                host: process.env.MAILTRAIP_HOST,
                port: process.env.MAILTRAP_PORT,
                auth: 
                {
                    user: process.env.MAILTRAP_USER,
                    pass: process.env.MAILTRAP_PASS
                }
            })

        return nodemailer.createTransport ({
            service: 'SendGrid',
            auth: {
                user: process.env.SENDGRID_USER,
                pass: process.env.SENDGRID_PASS
            }
        })
    }


    async send (subject:string, template:string) : Promise<void>
    {
        let html = await fs.promises.readFile (`${__dirname}/html/${template}.html`, 'utf-8');

        html = await styliner.processHTML (html);

        Object.entries (this.data).forEach (([key, value]) =>
            {
                html = html.replace (`<${key}>`, value);
            }
        )

        const mailOpts = 
        {
            to:this.to,
            from: process.env.MAIL_FROM,
            subject,
            html,
            text: htmlToText.convert (html)
        }

        this.newTransport ().sendMail (mailOpts);
    }


    async sendWelcome () : Promise<void>
    {
        await this.send ('Welcome to the Natours family', 'welcome');
    }
}