import { app, BrowserWindow, ipcMain } from "electron";
import Nedb from "nedb";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import os from "os";
import fs from "fs";
import crawling from "./crawling";
import axios, { AxiosResponse } from "axios";
import argon2 from "argon2";

import "reflect-metadata";
import { Client } from "pg";
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();
});

// [SERVER-DB CONNECT]
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "moapick",
  password: "5432",
  port: 5432,
});
client.connect();

// ＠ agreements
ipcMain.on("addInfo", async (evt, data) => {
  console.log("===========> ~ addInfo/data:", data);
  try {
    const { istermsagreement, isprivacypolicyagreement, ismarketingagreement } =
      data;
    client
      .query(
        `UPDATE "User" SET ("istermsagreement", "isprivacypolicyagreement", "ismarketingagreement") VALUES ($1, $2, $3)`,
        [istermsagreement, isprivacypolicyagreement, ismarketingagreement]
      )
      .then((res) => {
        console.log("약관동의서 저장완료", res);
        client.end();
      })
      .catch((e) => console.error(e.stack));
    //TODO: DB에 result 저장
    evt.reply("약관동의서 저장완료");
  } catch (error) {
    console.error("약관동의서 저장실패", error);
  }
});

// ＠ signup
ipcMain.on("signup", async (evt, data) => {
  console.log("===========> ~ signup/data:", data);
  try {
    // user정보 서버db에 저장
    const { email, name, password } = data;
    // 비밀번호 해쉬
    const hasedPassword = await argon2.hash(password);
    client
      .query(
        `INSERT INTO "User" ("email", "password", "name") VALUES ($1, $2, $3)`,
        [email, hasedPassword, name]
      )
      .then((res) => {
        console.log("회원정보 저장완료", res);
        client.end();
      })
      .catch((e) => console.error(e.stack));

    evt.reply("회원가입 성공");
  } catch (error) {
    console.error("회원가입 실패", error);
  }
});

// ＠ add info
ipcMain.on("addInfo", async (evt, data) => {
  console.log("===========> ~ signup/data:", data);
  try {
    const { phone, companyName, eid } = data;
    client
      .query(`INSERT INTO "User" ("phone") VALUES ($1)`, [phone])
      .then((res) => {
        console.log(res, `번호:"${phone}" 저장성공`);
        client.end();
      })
      .catch((e) => console.error(e.stack));

    client
      .query(`INSERT INTO "Company" ("companyName"."eid") VALUES ($1,$2)`, [
        companyName,
        eid,
      ])
      .then((res) => {
        console.log(
          res,
          `회사명, 사업자번호:"${companyName}, ${eid}" 저장성공`
        );
        client.end();
      })
      .catch((e) => console.error(e.stack));
    // (3) isLogin = true 변경
    //TODO: DB에 result 저장
    evt.reply("추가정보 저장완료");
  } catch (error) {
    console.error("추가정보 저장실패", error);
  }
});

// // ＠ login
// ipcMain.on("login", async (evt, data) => {
//   console.log("===========> ~ login/data:", data);
//   try {
//     // (1) password validate
//     const password = data.password;
//     //

//     // (2) validate pass? crawling start : error return
//     const result = await crawling(id, password);

//     //TODO: DB에 result 저장
//     evt.reply("success", result);
//   } catch (error) {
//     console.error(error);
//   }
// });
async function validatePassword(hasedPassword: string, inputPassword: string) {
  await argon2.verify(hasedPassword, inputPassword);
}
// ① greeting 계정연동
ipcMain.on("connect-greeting", async (evt, data) => {
  console.log("===========> ~ connect-greeting/data :", data);
  try {
    const apiKey = {
      greetingApiKey: data,
    };
    db.users.insert(apiKey);
    evt.reply("그리팅 계정 연동완료!");
  } catch (error) {
    console.error(error);
  }
});

// ② wanted 계정연동
ipcMain.on("connect-wanted", async (evt, data) => {
  console.log("===========> ~ connect-wanted/data :", data);
  try {
    const { id, password } = data;
    const wantedInfo = {
      wantedId: id,
      wantedPassword: password,
    };
    db.users.insert(wantedInfo);
    evt.reply("원티드 계정 연동완료!");
  } catch (error) {
    console.error(error);
  }
});

// ③ crawling 이벤트 수신 → 지원자 db저장 → 모든 지원자 정보 반환
ipcMain.on("crawling", async (evt) => {
  try {
    // TODO : 각 채용사이트별 크롤링 구분(현재:only wanted)
    await crawlingAndSaveApplicant();
    const allApplicantData = await findAllApplicant();
    evt.reply("success", allApplicantData);
  } catch (error) {
    console.error(error);
  }
});

// ④ greeting 등록(선택적)
ipcMain.on("send-greeting", async (evt, data) => {
  console.log("===========> ~ send-greeting/data :", data);
  try {
    const resigerStatus = register(data);
    console.log("===========> ~ resigerStatus:", resigerStatus);
    evt.reply("원티드 계정 연동완료!", register);
  } catch (error) {
    console.error(error);
  }
});

client
  .query(
    `INSERT INTO "" ("email", "password", "name", "phone") VALUES ($1, $2, $3, $4)`,
    ["test@gmail.com", "123qwe!!", "홍길동", "01023021020"]
  )
  .then((res) => {
    console.log(res);
    client.end();
  })
  .catch((e) => console.error(e.stack));

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

//LocalDB 저장 경로
const homedir = os.homedir();
const folderPath = path.join(homedir, "moapick-backdata");

if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath);
}
//DB 테이블 생성
const db = {
  applicants: new Nedb({
    filename: path.join(folderPath, "applicants.json"),
    autoload: true,
  }),
  users: new Nedb({
    filename: path.join(folderPath, "users.json"),
    autoload: true,
  }),
};
// const id = uuidv4();

//나중에는 users db에서 빼오기
const LOGINID = "sprata111@gamil.com";
const LOGINPASSWORD = "123qwe!!";
const ID = "contact@teamsparta.co";
const PASSWORD = "Tmvkfmxk0423!";
const greetingApiKey =
  "08dacc9b6d4f3ad04f3e31348e1627c69d8883df5eaee04ed3b78a2d8620f65c";
const ID2: string = undefined;
const PASSWORD2: string = undefined;
// const userInfo = {
//   commonId: LOGINID,
//   commonPassword: LOGINPASSWORD,
//   wantedId: ID || null,
//   wantedPassword: PASSWORD || null,
//   greetingApiKey: greetingApiKey || null,
//   programmersId: ID2 || null,
//   programmersPassword: PASSWORD2 || null,
//   createdAt: new Date(),
// };

// 로그인 자리

// db.users.insert(userInfo, (err: any, result: any) => {
//   console.log("===========> ~ result:", result);
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("새로운 지원자 추가완료");
//   }
// });
//★-- ① [wanted]크롤링 & DB저장 --★//
// crawlingAndSaveApplicant();// 테스트 실행 함수(주석을 풀어서 사용)
// logic = 크롤링 → 공고아이디(openingId) 통신 및 수신 → 최종 지원자 data form 작성 완료 → local DB 저장
async function crawlingAndSaveApplicant() {
  let successCount = 0;
  let failureCount = 0;
  const userInfo = await findAllUser();
  const { wantedId, wantedPassword } = userInfo;
  const crawlingData = await crawling(wantedId, wantedPassword);
  const openedPosts = await getOpeningIdApi();
  for (const data of crawlingData) {
    for (const applicant of data) {
      const title = applicant.position;
      const openingId = await findOpeningId(openedPosts, title);

      const applicantData = {
        isUploaded: false,
        name: applicant.name,
        email: applicant.email,
        phone: applicant.mobile.substr(3),
        openingId: openingId,
        title: applicant.position,
        filename: applicant.file_name,
        fileUrl: applicant.filePath,
        docName: "이력서",
        status: "지원접수",
        application_date: applicant.chk_time,
        referer: "원티드",
        countDownloaded: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      //--★ DB저장 ★--//
      try {
        await db.applicants.insert(applicantData);
        console.log("새로운 지원자 저장완료");
        successCount++;
      } catch (err) {
        console.log(err);
        failureCount++;
      }
    }
  }

  console.log(`저장 성공: ${successCount}명`);
  console.log(`저장 실패: ${failureCount}명`);
}

async function findOpeningId(responseData: any, title: string) {
  console.log("===========> ~ findOpeningId의 responseData:", responseData);
  // openingId 검색
  const openingInfo = await responseData.find(
    (data: any) => data.title === title
  );
  console.log("===========> ~ openingInfo:", openingInfo);
  console.log("===========> ~ openingInfo.id:", openingInfo.id);
  return openingInfo.id;
}

async function getOpeningIdApi() {
  // openingId 검색에 필요한 자료 가져오기
  const apiUrl = "https://oapi.greetinghr.com/openapi"; //todo: 환경변수처리
  const apiKey =
    "08dacc9b6d4f3ad04f3e31348e1627c69d8883df5eaee04ed3b78a2d8620f65c"; //todo: 환경변수처리
  const page = 0;
  const pageSize = 100;
  const queryParams = `?page=${page}&pageSize=${pageSize}`;
  try {
    const response = await axios.get(
      `${apiUrl}/published-openings${queryParams}`,
      {
        headers: {
          "X-Greeting-OpenAPI": `${apiKey}`,
        },
      }
    );

    const responseData = response.data.data.datas;
    console.log("===========> ~ responseData:", responseData);
    return responseData;
  } catch (err) {
    console.log(err);
  }
}
//-----------------------//

//★-- ② 그리팅 등록 --★//
// register([
//   "VTNC8Qfqie0ywkYo",
//   "4yYC2krwqWAhe7C6",
//   "2SQU5XZuFrSBA1cG",
//   "iAkEa2Mi74OoNzq9",
//   "pM2WjpyoEn3T5Z59",
// ]); //선택적(체크박스) _id 수신

async function register(
  ids: string[]
): Promise<{ successCount: number; failureCount: number }> {
  console.log("===========> ~ ids:", ids);
  let successCount = 0;
  let failureCount = 0;
  const applicants = await findMatchingIdApplicant(ids);
  console.log("===========> ~ applicants:", applicants);
  await Promise.all(
    applicants.map(async (existUser: any) => {
      const openingId = existUser.openingId;
      const applicantData = {
        openingId: openingId,
        name: existUser.name,
        email: existUser.email,
        phone: existUser.phone,
        referer: existUser.referer,
        optionalTermsAgree: existUser.optionalTermsAgree || false,
        documents: [
          {
            fileUrl: existUser.fileUrl,
            filename: existUser.filename,
            fileToken: existUser.fileToken || null,
            docName: existUser.docName,
          },
        ],
        questionnaires: [] as [],
        additionalApplicantInfo: null as null,
      };

      try {
        await applicantRequest(applicantData);
        existUser.isUploaded = true;
        existUser.updatedAt = new Date();

        await db.applicants.update({ _id: existUser._id }, existUser, {});

        successCount++;
      } catch (error) {
        console.error("Registration error:", error);
        failureCount++;
      }
    })
  );

  return { successCount, failureCount };
}
// // //--모든 정보 불러오기--//
// db.find({},function (err: Error, allApplicantData: any)  {
//   // console.log("===========> ~ result:", allApplicantData);
// })

//★--greeting 지원자 등록 api--★// 일단 하나씩 등록
async function applicantRequest(applicantData: any): Promise<AxiosResponse> {
  const apiUrl = "https://oapi.greetinghr.com/openapi"; //todo: 환경변수처리
  const apiKey =
    "08dacc9b6d4f3ad04f3e31348e1627c69d8883df5eaee04ed3b78a2d8620f65c"; //todo: 환경변수처리
  return axios.post(`${apiUrl}/applicant`, applicantData, {
    headers: {
      "Content-Type": "application/json",
      "X-Greeting-OpenAPI": `${apiKey}`,
    },
  });
}

//★--모든 지원자 정보 불러오기--★//
function findAllApplicant() {
  return new Promise((resolve, reject) => {
    db.applicants.find({}, function (err: Error, allApplicantData: any) {
      if (err) {
        reject(err);
      } else {
        console.log("===========> ~ allApplicantData:", allApplicantData);
        resolve(allApplicantData);
      }
    });
  });
}

//★-- 해당 id에 맞는 지원자 정보 불러오기--★//
function findMatchingIdApplicant(ids: string[]): Promise<string[]> {
  return new Promise((resolve, reject) => {
    db.applicants.find(
      { _id: { $in: ids } },
      function (err: Error, findMatchingIdApplicant: any) {
        if (err) {
          reject(err);
        } else {
          console.log(
            "===========> ~ allApplicantData:",
            findMatchingIdApplicant
          );
          resolve(findMatchingIdApplicant);
        }
      }
    );
  });
}

//★--모든 user 정보 불러오기--★//
function findAllUser():Promise<any> {
  return new Promise((resolve, reject) => {
    db.users.find({}, function (err: Error, allUserData: any) {
      if (err) {
        reject(err);
      } else {
        const userInfo = allUserData[0];
        resolve(userInfo);
      }
    });
  });
}
//-----------------------//

// function isUploaded(email: string) {
//   db.find({ email: email }, (err: Error | null, candidates: any[]) => {
//     if (err) {
//       console.error("Find error :", err);
//       return;
//     }

//     if (candidates.length === 0) {
//       console.log(`${email} 이메일 주소를 가진 지원자가 존재하지 않습니다.`);
//       return;
//     }

//     // 'isUploaded' 컬럼의 값을 `true`로 변경하고, 업데이트를 수행합니다.
//     candidates.forEach((candidate) => {
//       const updateData = { $set: { isUploaded: true } };
//       db.update({ _id: candidate._id }, updateData, {}, (err, numReplaced) => {
//         if (err) {
//           console.error("Update error :", err);
//           return;
//         }
//         console.log(`Updated ${numReplaced} document(s).`);
//       });
//     });
//   });
// }

//----------------------------------------------------//
// async function register1(email: string) {
//   try {
//     const existUserEmail = await findOneEmail(email);
//     if (!existUserEmail) {
//       throw Error(`${email}은 존재하지 않는 지원자입니다.`);
//     }
//     const existUserString = await readFileAsync(email); // JSON 형식의 문자열
//     const existUser = JSON.parse(existUserString); // JSON 문자열을 객체로 파싱
//     // 지원자 openingId 찾기
//     const openingId = existUser.openingId;
//     console.log("===========> ~ openingId:", openingId);
//     // 저장되는 DATA 빌드
//     const applicantData = {
//       openingId: openingId,
//       name: existUser.name,
//       email: existUser.email,
//       phone: existUser.phone,
//       referer: existUser.referer,
//       optionalTermsAgree: existUser.optionalTermsAgree,
//       documents: [
//         {
//           fileUrl: existUser.fileUrl,
//           filename: existUser.filename,
//           fileToken: existUser.fileToken,
//           docName: existUser.docName,
//         },
//       ],
//       questionnaires: [] as any[],
//       additionalApplicantInfo: null as null,
//     };
//     console.log("===========> ~ applicantData:", applicantData);
//     // const candidates = await this.findCandidates(email); // 후보자 목록 조회
//     // if (candidates.length === 0) {
//     //   console.log(`${email} 이메일 주소를 가진 지원자가 존재하지 않습니다.`);
//     //   return;
//     // }

//     // // 'isUploaded' 컬럼의 값을 `true`로 변경하고, 업데이트를 수행합니다.
//     // candidates.forEach((candidate:any) => {
//     //   const updateData = { $set: { isUploaded: true } };
//     //   db.update({ _id: candidate._id }, updateData, {}, (err, numReplaced) => {
//     //     if (err) {
//     //       console.error("Update error :", err);
//     //       return;
//     //     }
//     //     console.log(`Updated ${numReplaced} document(s).`);
//     //   });
//     // });

//     await applicantRequest(applicantData);
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }
// register("minaShin@gmail.com");
