require("dotenv").config();
import { startOAuthAuthentication } from "./robots/auth";
import mailRobot from "./robots/mail";
import textRobot from "./robots/text";
import imageRobot from "./robots/image";

const robots = {
  auth: startOAuthAuthentication,
  mail: mailRobot,
  text: textRobot,
  image: imageRobot
};

interface content {
  emailBody?: any;
}

async function start() {
  console.log("> [orchestrator] Initializing system");

  // await robots.auth();
  // await robots.mail();
  // await robots.text();
  await robots.image();

  return;
}

start();
