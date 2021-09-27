import base64url from "base64-url";
import fs from "fs";

import * as cheerio from "cheerio";

import { gmail_v1 } from "googleapis";

import { getGmailInstance } from "./auth";

// import emailData from "../storage/email";

interface news {
  title: string;
  body: string;
  link?: string;
}

async function mailRobot(content: any) {
  const Gmail = getGmailInstance();

  const newEmailId = await searchForNewEmails(Gmail);
  const emailData = await getEmailData(newEmailId);

  breakEmailIntoNews(emailData, content);

  return;

  async function searchForNewEmails(Gmail: gmail_v1.Gmail) {
    try {
      console.log("> [mail-robot] - Searching for new emails");

      const emailList = await Gmail.users.messages.list({
        userId: "me",
        q: "from:newsletter@filipedeschamps.com.br",
      });

      const emailsFromNewsletter = emailList.data.messages;

      const message = emailsFromNewsletter[0];
      if (message?.id) {
        return message.id;
      }
    } catch (err) {
      console.log("> [mail-robot] Error on search for new emails: ", err);
    }
  }

  async function getEmailData(id: string) {
    try {
      const email = await getMailById(id);
      console.log("> [mail-robot] - Returning email in html format");

      const fullEmailBody = email.data.payload?.parts[1].body?.data;
      const emailHTML = base64url.decode(fullEmailBody);

      return emailHTML;
    } catch (err) {
      console.log("> [mail-robot] Error on get email data: ", err);
    }
  }

  async function getMailById(id: string) {
    console.log("> [mail-robot] - Getting latest email data");

    return await Gmail.users.messages.get({
      userId: "me",
      id: id,
      format: "full",
    });
  }

  function breakEmailIntoNews(email: string, content: Object) {
    const $ = cheerio.load(email);

    const emailTitle = $("title").text();

    const fillByTag = {
      tag(Obj: any, news: news) {
        if (Obj.name === "a") news.link = Obj.attribs.href;
        if (Obj.name === "strong") news.title = $(Obj).text().replace(/:$/, "");
      },
      text(Obj: any, news: news) {
        const text = $(Obj)
          .text()
          .replace(/\n+\t+/g, "");
        if (/\S/.test(text)) news.body = text.replace(/^:/, "");
      },
    };

    let newsIndex: number = 0;
    let adsIndex: number = 0;

    $("p").each((i, item) => {
      const numberOfChildren = item.children.length;

      if (i > 0) {
        const news = {};
        item.childNodes.map((Obj) => fillByTag[Obj.type](Obj, news));

        if (numberOfChildren === 2) {
          content.news[newsIndex] = {
            id: newsIndex + 1,
            ...news,
            sentences: [],
          };
          newsIndex++;
        }
        if (numberOfChildren >= 3) {
          content.advertising[adsIndex] = {
            id: adsIndex + 1,
            ...news,
            sentences: [],
          };
          adsIndex++;
        }
      }
    });
  }
}

export default mailRobot;
