import { app, BrowserWindow, ipcMain } from "electron";
import Nedb from "nedb";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import os from "os";
import fs from "fs";
import iconv from "iconv-lite";
import crawling from "./crawling";
import axios, { AxiosResponse } from "axios";

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

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();


  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // onInputValue �̺�Ʈ ����
  ipcMain.on("login", async (evt, payload) => {
    console.log("login", payload);
    try {
      const { id, password } = payload;
      const result = await crawling(id, password);


      //TODO: DB에 result 저장
      evt.reply("success", result);
    } catch (error) {
      console.error(error);
    }
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

//Local�� ����
const homedir = os.homedir();
const folderPath = path.join(homedir, "moapick-backdata",);
const dbPath = path.join(folderPath, "applicants.json");
if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath);
}
//DB �ν��Ͻ� ����
const db = new Nedb({
  filename: dbPath,
  autoload: true,
});
const id = uuidv4();

// fs.readFile('./applicants.json', 'utf8', function(err, data) {
//   console.log(data)
//   console.log(JSON.parse(data))
// });

const applicantData = {
  id: id,
  name: "�þ���",
  email: "xia@gmail.com",
  phone: "01011112222",
  title: "�׽�Ʈ",
  filename: "resume1.pdf",
  fileurl:
    "https://blog.kakaocdn.net/dn/C8kUo/btqEjCGNiq2/oENoAsTJvcqtdgykO7xqIk/SQLD_34_%EA%B8%B0%EC%B6%9C%EB%AC%B8%EC%A0%9C.pdf?attach=1&knm=tfile.pdf",
  docName: "�̷¼�",
  status: "�������",
  createdAt: new Date(),
  application_date: "2023-03-01",
  referer: "��Ƽ��",
  countDownloaded: 0,
  isUploaded: false,
  companyId: 1,
  openingId: 84400,
};

// // //--������ ���� DB ����--//
// db.insert(applicantData, (err, result) => {
//   console.log("===========> ~ result:", result)
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("���ο� ������ �߰��Ϸ�");
//   }
// });

// const emails = ["minaShin@gmail.com", "parkcansee@naver.com", "xia@gmail.com"];
// //(����)�̸��Ϸ� ������ ã��
// function findUsersByEmail(emails: string[]) {
// db.find({ email: { $in: emails } }, (err: Error | null, results: any[]) => {
//   // �̸��� �ּҿ� �´� ������ ������ ��ȯ
//   results.forEach((result) => {
//     if (result) {
//       console.log("===========> ~ result:", result);
//     }
//     // else {
//     //   console.log(`${email} �̸��� �ּҸ� ���� �����ڰ� �������� �ʽ��ϴ�.`);
//     // }
//   });
// });
// }
// findUsersByEmail(emails);

// // //--(�ܼ�)�̸��Ϸ� ������ ã��--//
// async function findOneEmail(email: string): Promise<any | null> {
//     // const emailsString = await readFileAsync(email); // JSON ������ ���ڿ�
//     // const emails = JSON.parse(emailsString); // JSON ���ڿ��� ��ü�� �Ľ�

//     return new Promise((resolve, reject) => {
//       db.find({ email: email }, (err: Error | null, result: any) => {
//         if (err) {
//           reject(err);
//         } else if (result.length === 0) {
//           console.log(
//             `${email} �̸��� �ּҸ� ���� �����ڰ� �������� �ʽ��ϴ�.`
//           );
//           resolve(null);
//         } else {
//           resolve(result[0]);
//         }
//       });
//     });

// }
// // //--��� ���� �ҷ�����--//
  db.find({},function (err: Error, allApplicantData: any)  {
    // console.log("===========> ~ result:", allApplicantData);

    console.log("-------->", allApplicantData);
  });

// function isUploaded(email: string) {
//   db.find({ email: email }, (err: Error | null, candidates: any[]) => {
//     if (err) {
//       console.error("Find error :", err);
//       return;
//     }

//     if (candidates.length === 0) {
//       console.log(`${email} �̸��� �ּҸ� ���� �����ڰ� �������� �ʽ��ϴ�.`);
//       return;
//     }

//     // 'isUploaded' �÷��� ���� `true`�� �����ϰ�, ������Ʈ�� �����մϴ�.
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
// async function register(email: string) {
//   try {
//     const existUserEmail = await findOneEmail(email);
//     if (!existUserEmail) {
//       throw Error(`${email}�� �������� �ʴ� �������Դϴ�.`);
//     }
//     const existUserString = await readFileAsync(email); // JSON ������ ���ڿ�
//     const existUser = JSON.parse(existUserString); // JSON ���ڿ��� ��ü�� �Ľ�
//     // ������ openingId ã��
//     const openingId = existUser.openingId;
//     console.log("===========> ~ openingId:", openingId);
//     // ����Ǵ� DATA ����
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
//     // const candidates = await this.findCandidates(email); // �ĺ��� ��� ��ȸ
//     // if (candidates.length === 0) {
//     //   console.log(`${email} �̸��� �ּҸ� ���� �����ڰ� �������� �ʽ��ϴ�.`);
//     //   return;
//     // }

//     // // 'isUploaded' �÷��� ���� `true`�� �����ϰ�, ������Ʈ�� �����մϴ�.
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

// async function applicantRequest(applicantData: any): Promise<AxiosResponse> {
//   const apiUrl = "https://oapi.greetinghr.com/openapi"; //todo: ȯ�溯��ó��
//   const apiKey =
//     "08dacc9b6d4f3ad04f3e31348e1627c69d8883df5eaee04ed3b78a2d8620f65c"; //todo: ȯ�溯��ó��
//   return axios.post(`${apiUrl}/applicant`, applicantData, {
//     headers: {
//       "Content-Type": "application/json",
//       "X-Greeting-OpenAPI": `${apiKey}`,
//     },
//   });
// }
