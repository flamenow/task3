const puppeteer = require('puppeteer');
const md5 = require('md5');
const axios = require('axios');
const HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json",
};
const acc_info = {
   "email": "marcosmujica3@gmail.com",
  "password": "aaf24b46a27e3159c7221f319867ab86"
};
async function get_token() {
  const signIn_URL = "https://api.multilogin.com/user/signin";
  try {
      const response = await axios.post(signIn_URL, acc_info, {
          headers: HEADERS
      });
      return response.data.data.token;
  } catch (error) {
      console.log(error.message);
      console.log("Response data:", error.response.data);
      return false;
  }
};
// Insert the Folder ID and the Profile ID below
const folder_id = "90725827-6478-431e-926b-af3915a350c7";
const profile_id = "b115ccd1-b7b3-496e-9661-f1d4b468c97c";

const capitals = ['Pyongyang', 'London', 'Montevideo', 'Beijing', 'Beirut'];
let count1 = 0;

async function start_browserProfile() {
  const token = await get_token();
  if (!token) return;
  // Update HEADERS with bearer token retrieved from the get_token function
  HEADERS.Authorization = 'Bearer ' + token;
  // Launch a profile defining "Puppeteer" as automation type
  const profileLaunch_URL = `https://launcher.mlx.yt:45001/api/v2/profile/f/${folder_id}/p/${profile_id}/start?automation_type=puppeteer&headless_mode=true`;
  try {
      const response = await axios.get(profileLaunch_URL, {
          headers: HEADERS
      });
      const browserURL = `http://127.0.0.1:${response.data.data.port}`;
      // if you prefer to connect with browserWSEndpoint, try to get the webSocketDebuggerUrl by following request
      // const { data: { webSocketDebuggerUrl } } = await axios.get(`${browserURL}/json/version`)
      const browser = await puppeteer.connect({
          browserURL: browserURL,
          timeout: 10000
      });

      async function getWeather(capital) {
        const page = await browser.newPage();
        await page.goto("https://google.com");
        // Access Google
        await page.locator('.gLFyf').fill(`${capital} weather`);
        // Locates the search bar and types the capital name followed by the word "weather"
        await page.keyboard.press('Enter');
        // Presses the Enter key
        await page.waitForSelector('h3');
        // Waits for the selector to load
        const weatherValue = await page.$eval('#wob_tm', element => element.textContent); 
        // Gets the temperature value
        const climate = await page.$eval('#wob_tm', element => element.textContent); 
        await page.close();
        return climate; 
      }
      
      async function getCapitalsWeather() { 
        const weathers = [];
        for (let i = 0; i < capitals.length; i++) {
          const capital = capitals[i];
          const climate = await getWeather(capital);
          weathers.push({ capital, climate }); 
        } // End of for loop that calls the getWeather function for each capital in the capitals array and pushes the result to the weathers array
        await browser.close();
        return weathers;
      }

      getCapitalsWeather().then(weathers => { 
        console.log(weathers);
      });

  } catch (error) {
      console.log("Error:", error.message);
      if (error.response) {
          console.log("Response data:", error.response.data);
      }
  }
}

start_browserProfile();
