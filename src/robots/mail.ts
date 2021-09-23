import { gmail_v1 } from "googleapis";
import { getGmailInstance } from "./auth";

import base64url from "base64-url";
import fs from "fs";

async function mailRobot() {
  const Gmail = getGmailInstance();

  const newEmailId = await searchForNewEmails(Gmail);

  const emailData = await getEmailData(newEmailId);

  return emailData;

  async function searchForNewEmails(Gmail: gmail_v1.Gmail) {
    const emailList = await Gmail.users.messages.list({ userId: "me" });
    const newEmailList = emailList.data.messages?.splice(0, 10);

    if (newEmailList.length !== 0) {
      // for (const message of newEmailList) {
      const message = newEmailList[0];
      if (message.id) {
        return message.id;
      }
    }
  }

  async function getEmailData(id: string) {
    const email = await getMailById(message.id);

    const raw = email.data.payload?.parts[1].body?.data;
    const emailHTML = await base64url.decode(raw);

    return emailHTML;
  }

  async function getMailById(id: string) {
    return await Gmail.users.messages.get({
      userId: "me",
      id: id,
      format: "full",
    });
  }
}

export default mailRobot;
