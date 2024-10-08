import dotenv from 'dotenv';
import path from 'path';

dotenv.config({path: path.join(process.cwd(), '.env')});

const CLIENT_URL = process.env.NODE_ENV === "development" ? process.env.CLIENT_LOCAL_URL : process.env.CLIENT_URL;
const BACKEND_URL = process.env.NODE_ENV === "development" ? process.env.BACKEND_LOCAL_URL : process.env.BACKEND_URL;
const REDIS_URL = process.env.NODE_ENV === "development" ? process.env.REDIS_LOCAL_URL : process.env.REDIS_URL;

export default {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    default_doctor_pass: process.env.DOCTOR_PASS,
    clientUrl: CLIENT_URL,
    jwt: {
        secret: process.env.JWT_SCRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRED_IN,
        refresh_secret: process.env.JWT_REFRESH_SCRET,
    },
    cloudinary: {
        name: process.env.CLOUDINARY_NAME,
        key: process.env.CLOUDINARY_API_KEY,
        secret: process.env.CLOUDINARY_API_SECRET
    },
    emailPass: process.env.EMAIL_PASS,
    adminEmail: process.env.ADMIN_EMAIL,
    gmail_app_Email: process.env.GMAIL_APP_EMAIL,
    defaultAdminDoctor: process.env.DEFULT_ADMIN_DOCTOR,
    backendUrl: BACKEND_URL,
    redis_url: REDIS_URL
}