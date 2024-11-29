import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import config from '../config';

export const Transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'muskanth456@gmai.com',    // Your Gmail address
        pass: 'Kumar146@',    // Your Gmail password or app password
    }
});