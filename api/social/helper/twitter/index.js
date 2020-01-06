const credentials = require("./credentials.json").credentials;
const puppeteer = require('puppeteer')
const { loginToTwitter, tweetAfterLogin } = require("./utils");
const viewport = {
  width: 1200,
  height: 3000
};
//   {headless:false,userDataDir: "./user_data"}
const puppeteerConfig = {
  headless: false,
  args: [`--window-size=${viewport.width},${viewport.height}`],
  defaultViewport: {
    height: viewport.height,
    width: viewport.width
  }
};
module.exports = async tweet => {
  console.log('tweeting: ',tweet)
  return true

  const user = credentials[0];
  const browser = await puppeteer.launch(puppeteerConfig);
  const page = await browser.newPage();
  await loginToTwitter(page, user.email, user.password);

  await tweetAfterLogin(page, tweet);
  browser.close();
  return true
};
