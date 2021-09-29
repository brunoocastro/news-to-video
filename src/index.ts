import mailRobot from "./robots/mail";
import { startOAuthAuthentication } from "./robots/auth";
import textRobot from "./robots/text";
require("dotenv").config();

const robots = {
  auth: startOAuthAuthentication,
  mail: mailRobot,
  text: textRobot,
};

interface content {
  emailBody?: any;
}

async function start() {
  console.log("> [orchestrator] Initializing system");

  await robots.auth();
  await robots.mail();
  await robots.text();

  return;
}

start();
