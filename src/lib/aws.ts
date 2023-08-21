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

const getSingedUrl = async function (urlParams: any): Promise<string> {
  return new Promise((resolve, reject) => {
    s3.getSignedUrl("getObject", urlParams, (err, url) => {
      if (err) reject(err);
      else resolve(url);
    });
  });
};

/**s3에 파일을 올리고 다운받을 수 있는 pre-signed url을 반환하는 함수 */
const uploadFileAndGetSingedUrl = async (fileName: string) => {
  try {
    // S3에 업로드
    const data = await uploadFile(fileName);

    console.log(
      "🚀 ~ file: aws.ts:49 ~ uploadFileAndGetSingedUrl ~ data:",
      data
    );
    console.log(`Successfully uploaded data to ${data.Bucket}/${data.Key}`);

    // 업로드가 성공하면 Pre-Signed URL 생성
    const urlParams = { Bucket: data.Bucket, Key: data.Key, Expires: 3600 };
    const url = await getSingedUrl(urlParams);

    console.log("The URL is", url); // 생성된 Pre-Signed URL 출력
  } catch (err) {
    console.log("Error: ", err);
  }
};

export default uploadFileAndGetSingedUrl;
