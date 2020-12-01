"use strict";
const S3 = require("aws-sdk/clients/s3");

const getS3Configuration = (sourceBucket) => {
  return {
    accessKeyId: process.env[`KOYEB_STORE_${sourceBucket}_ACCESS_KEY`],
    secretAccessKey: process.env[`KOYEB_STORE_${sourceBucket}_SECRET_KEY`],
    region: process.env[`KOYEB_STORE_${sourceBucket}_REGION`],
    endpoint: process.env[`KOYEB_STORE_${sourceBucket}_ENDPOINT`],
  };
};

const handler = async (event) => {
  const bucket = "out"; 
  const key = event?.object?.key;

  const s3Instance = new S3(getS3Configuration(bucket));

  const res = await s3.listObjects({}).promise();
  console.log(res);
};

module.exports.handler = handler;
