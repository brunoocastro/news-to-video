import mailRobot from "./robots/mail";
import { startOAuthAuthentication } from "./robots/auth";
require("dotenv").config();

const robots = {
  auth: startOAuthAuthentication,
  mail: mailRobot,
};

interface content {
  emailBody?: any;
}

async function start() {
  const content: any = {
    source: {},
    news: [],
    advertising: [],
  };

  await robots.auth();

  await robots.mail(content);

  console.log("Content: \n", content);
}

start();
