import { chromium } from "playwright";
import dotenv from "dotenv";

dotenv.config();

const buttonSelector = {
  emailInput: "input[name='email']",
  passwordInput: "input[name='password']",
  submitButton: 'button[type="submit"]',
};

//로그인
async function login(page, ID, PW) {
  await page.goto(
    "https://id.wanted.jobs/login?before_url=https%3A%2F%2Fwww.wanted.co.kr%2Fdashboard%2Fuser%2Fcheck&redirect_url=https%3A%2F%2Fwww.wanted.co.kr%2Fapi%2Fchaos%2Fauths%2Fv1%2Fcallback%2Fset-token&client_id=3cxYxwiZG2Hys8DvQjwJzxMm&service=dashboard&amp_device_id=undefined"
  );

  await (await page.waitForSelector(buttonSelector.emailInput)).type(ID);
  await (await page.waitForSelector(buttonSelector.submitButton)).click();

  await (await page.waitForSelector(buttonSelector.passwordInput)).type(PW);
  await (await page.waitForSelector(buttonSelector.submitButton)).click();
  console.log("로그인 성공");

  await page.waitForNavigation();
}

//채용중인 공고페이지로 이동
async function navigateJobPostings(page) {
  await page.goto(
    "https://www.wanted.co.kr/dashboard/recruitment?order=id&status=active"
  );
}

/**채용공고 가져오기*/
async function getJobPostings(page) {
  console.log("채용공고 가져오는 중");
  await page.waitForSelector(
    "td.styled__TableData-sc-10oxjpl-3.kiCEfJ a[data-attribute-id='biz__recruitmentList__position__click']"
  );
  const elements = await page.$$(
    "td.styled__TableData-sc-10oxjpl-3.kiCEfJ a[data-attribute-id='biz__recruitmentList__position__click']"
  );

  let applyPostId = [];
  for (let element of elements) {
    const text = await element.$eval(
      "span.gtNgFZ span",
      (node) => node.innerText
    );
    if (parseInt(text, 10) > 0) {
      const href = await element.evaluate((node) =>
        node.getAttribute("data-position-id")
      );
      applyPostId.push(href);
    }
  }
  console.log("채용공고 가져오기 완료");
  return applyPostId;
}

/**지원자카드 Id 가져오기*/
async function getUserCardsId(page, postId) {
  const data = await page.evaluate(
    (postId) => {
      const baseUrl = location.href.substring(
        0,
        location.href.indexOf(".kr") + 3
      );

      const newUrl = `${baseUrl}/api/dashboard/chaos/applications/v1?column_index=send&position_id=${postId}&is_reject=false`;
      return fetch(newUrl)
        .then((res) => res.json())
        .then((data) => data.data);
    },
    [postId]
  );
  const userCardsId = data.map((user) => user.id);
  return userCardsId;
}

//지원자 이력서 다운로드 및 정보 가져오기
async function testSaveUserResume(page, postId) {
  const url = `https://www.wanted.co.kr/dashboard/recruitment/${postId}?application=is_exclude_reject`;
  await page.goto(url);

  // Get user cards
  const userCardsIds = await getUserCardsId(page, postId);

  let allUserInfo = [];
  for (let userCardId of userCardsIds) {
    const url = `https://www.wanted.co.kr/dashboard/recruitment/176159?application=is_exclude_reject&application_detail=${userCardId}`;
    await page.goto(url);

    let userInfo = {};
    //user데이터
    const data = await page.evaluate(async (userCardId) => {
      const baseUrl = location.href.substring(
        0,
        location.href.indexOf(".kr") + 3
      );

      const newUrl = `${baseUrl}/api/dashboard/chaos/applications/v1/${userCardId}`;
      const res = await fetch(newUrl);
      const data = await res.json();
      return data;
    }, userCardId);

    //이력서 이름
    const resume = await page.evaluate(async (userCardId) => {
      const baseUrl = location.href.substring(
        0,
        location.href.indexOf(".kr") + 3
      );

      const newUrl = `${baseUrl}/api/dashboard/chaos/resumes/v1/apply/${userCardId}`;
      const res = await fetch(newUrl);
      const data = await res.json();
      return data;
    }, userCardId);

    const { name, email, mobile } = data.data.user;
    userInfo["name"] = name;
    userInfo["email"] = email;
    userInfo["mobile"] = mobile;
    userInfo["position"] = data.data.job.position;
    userInfo["file_name"] = resume.data[0].file_name;
    userInfo["chk_time"] = data.data.chk_time;

    allUserInfo.push(userInfo);

    const [download] = await Promise.all([
      page.waitForEvent("download"), // wait for download to start
      page.click('button:has-text("다운로드")'),
    ]);

    const path = await download.suggestedFilename();
    const filePath = "./resume/" + path;
    await download.saveAs(filePath);
    userInfo["filePath"] = filePath;
  }

  return allUserInfo;
}

async function crawling(ID, PW) {
  const browser = await chromium.launch({
    headless: false,
  });
  const userAgent =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36";
  const context = await browser.newContext({ userAgent });
  context.setDefaultNavigationTimeout(0);
  context.setDefaultTimeout(0);

  const page = await context.newPage({});

  // Log in
  await login(page, ID, PW);

  await navigateJobPostings(page);

  const applyPostIds = await getJobPostings(page);

  let allUserInfo = [];
  for (let postId of ["176159"]) {
    const userInfoByJobPosting = await testSaveUserResume(page, postId);
    allUserInfo.push(userInfoByJobPosting);
    // console.log(allUserInfo);
  }
  console.log(allUserInfo);
  await browser.close();
  return allUserInfo;
}

export default crawling;
