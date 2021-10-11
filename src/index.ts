require("dotenv").config();
import { startOAuthAuthentication } from "./robots/auth";
import mailRobot from "./robots/mail";
import textRobot from "./robots/text";
import imageRobot from "./robots/image";
import audioRobot from "./robots/audio";

const robots = {
  auth: startOAuthAuthentication,
  mail: mailRobot,
  text: textRobot,
  image: imageRobot,
  audio: audioRobot,
};

interface content {
  emailBody?: any;
}

async function start() {
  console.log("> [orchestrator] Initializing system");

  await robots.auth();
  await robots.mail();
  await robots.text();
  await robots.image();
  await robots.audio();

  console.log("Process finished!");

  return;
}

start();
