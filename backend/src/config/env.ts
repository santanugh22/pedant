import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  API_BASE_PATH: process.env.API_BASE_PATH || '/api/v1',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/feedants?replicaSet=rs0',
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'feedants_jwt_access_secret_key_2026_dev',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'feedants_jwt_refresh_secret_key_2026_dev',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_key_feedants',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_feedants',
  UPLOAD_PROVIDER: process.env.UPLOAD_PROVIDER || 'local', // 'local' or 's3'
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  AWS_REGION: process.env.AWS_REGION || 'ap-south-1',
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || 'feedants-submissions',
  REGISTRATION_HOLD_TTL_MINUTES: parseInt(process.env.REGISTRATION_HOLD_TTL_MINUTES || '15', 10),
  REFERRAL_REWARD_AMOUNT: parseInt(process.env.REFERRAL_REWARD_AMOUNT || '10', 10),
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:8081,http://127.0.0.1:8081').split(','),
};
