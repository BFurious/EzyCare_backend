import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import config from '../config';
const OAuth2 = google.auth.OAuth2;


// const oauth2Client = new OAuth2(
//     '265605923744-mt0so60cf5ofosjfjo3orsqlpib8tbgs.apps.googleusercontent.com',
//     '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',
//     'YOUR_REDIRECT_URL'
// );

// oauth2Client.setCredentials({
//     refresh_token: 'YOUR_REFRESH_TOKEN',
// });
// const accessToken : any = oauth2Client.getAccessToken();

// export const Transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         type: 'OAuth2',
//         user: 'your-email@gmail.com',
//         clientId: '265605923744-mt0so60cf5ofosjfjo3orsqlpib8tbgs.apps.googleusercontent.com',
//         clientSecret: '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',
//         refreshToken: 'YOUR_REFRESH_TOKEN',
//         accessToken: accessToken.token!,
//     },
// });

export const Transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'muskanth456@gmai.com',    // Your Gmail address
        pass: 'Kumar146@',    // Your Gmail password or app password
    }
});