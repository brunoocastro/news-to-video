import fs from "fs";
import path from "path";

const storagePath = path.resolve("src", "storage");
const backupPath = path.resolve("src", "storage", 'backup');

const stateFilename = "/state.json";
const mailIdsFilename = "/emailIds.json";

if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath);
}

if (!fs.existsSync(backupPath)) {
  fs.mkdirSync(backupPath);
}

function saveState(state: Object) {
  const stateString = JSON.stringify(state);
  return fs.writeFileSync(storagePath + stateFilename, stateString);
}

function loadState() {
  const fileBuffer = fs.readFileSync(storagePath + stateFilename, "utf-8");
  const stateJSON = JSON.parse(fileBuffer);
  return stateJSON;
}

function finishProcess() {
  const actualState = loadState()
  fs.writeFileSync(backupPath + `/${actualState.source?.id}.json`, JSON.stringify(actualState));
  return  
}

function emailAlreadyProcessed(id: string): boolean {
  const emailPath = storagePath + mailIdsFilename;
  try {
    if (fs.existsSync(emailPath)) {
      const fileBuffer = fs.readFileSync(emailPath, "utf-8");
      const emailIdsJSON = JSON.parse(fileBuffer);
      const emailIdsArray = Object.values(emailIdsJSON);
      return emailIdsArray.includes(id);
    }
    const baseMail: string[] = [];
    fs.writeFileSync(emailPath, JSON.stringify(baseMail));
    return false;
  } catch (err) {
    console.error(err);
    return false;
  }
}

function setEmailAsProcessed(id: string) {
  const emailPath = storagePath + mailIdsFilename;
  try {
    if (fs.existsSync(emailPath)) {
      const fileBuffer = fs.readFileSync(emailPath, "utf-8");
      const emailIdsJSON = JSON.parse(fileBuffer);
      const emailIdsArray = Object.values(emailIdsJSON);

      emailIdsArray.push(id);

      return fs.writeFileSync(emailPath, JSON.stringify(emailIdsArray));
    }
    const baseMail: string[] = [];
    baseMail.push(id);
    return fs.writeFileSync(emailPath, JSON.stringify(baseMail));
  } catch (err) {
    console.error(err);
    return
  }
}

export { saveState, loadState, finishProcess, emailAlreadyProcessed, setEmailAsProcessed };
