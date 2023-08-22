import AWS, { S3 } from "aws-sdk";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  region: "ap-northeast-2",
  signatureVersion: "v4",
});

const uploadFile = (fileName: string): Promise<S3.ManagedUpload.SendData> => {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(fileName);

    // 파일 설정
    const params = {
      Bucket: "moapick",
      Key: fileName,
      Body: fileContent,
    };

    // 파일 업로드
    s3.upload(params, function (err: unknown, data: S3.ManagedUpload.SendData) {
      if (err) {
        reject(err);
      }
      console.log(`File uploaded to S3: ${data.Location}`);
      resolve(data);
    });
  });
};

export default uploadFile;
