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
  console.log("> [orchestrator] Initializing project")
  await robots.auth();
  await robots.mail();
}

start();
