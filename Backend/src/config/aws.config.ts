import { S3Client } from "@aws-sdk/client-s3";
require("dotenv").config();

// Create S3 client with AWS SDK v3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  // Setting maximum expirationTime for signed URLs - 1 week in seconds
  // Other options that might be needed can be added here
});

export default s3;
