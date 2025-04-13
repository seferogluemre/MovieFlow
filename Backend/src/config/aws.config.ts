import AWS from "aws-sdk";
require("dotenv").config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});

export default s3;
