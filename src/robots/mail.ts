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
  const emailData = await fetchEmailContent(newEmailId, content);

  breakEmailIntoNews(emailData, content);

  return;

  async function searchForNewEmails(Gmail: gmail_v1.Gmail) {
    try {
      console.log("> [mail-robot] - Searching for new emails");

      const emailsFromNewsletter = await getEmailList();

      const newEmailId = await getUnprocessedEmail(emailsFromNewsletter);

      return String(newEmailId);
    } catch (err) {
      console.log("> [mail-robot] Error on search for new emails: ", err);
      throw new Error("Não foi possivel obter um email para processar");
    }

    async function getEmailList(): Promise<Object> {
      return new Promise(async (resolve, reject) => {
        const getEmailListFromGmail = await Gmail.users.messages.list({
          userId: "me",
          q: "from:newsletter@filipedeschamps.com.br",
        });

        const emailList = getEmailListFromGmail.data.messages;

        if (emailList?.length && emailList?.length > 0) resolve(emailList);

        reject({ message: "Nenhum email retornado" });
      });
    }

    async function getUnprocessedEmail(emailList: Object): Promise<string> {
      return new Promise(async (resolve, reject) => {
        const processedEmailIds = [""];

        for (const email of Object.values(emailList).reverse()) {
          if (processedEmailIds.includes(email.id)) continue;
          console.log(`> [mail-robot] - Found a new email with id ${email.id}`);
          // Adicionar email a lista de emails já processados.
          processedEmailIds.push(email.id);
          resolve(email.id);
          break
        }

        reject({
          name: "No new email",
          message: "No one email unprocessed",
        });
      });
    }
  }

  async function fetchEmailContent(id: string, content: any) {
    try {
      console.log(content.source);
      content.source.id = id;
      const fullEmail = await getMailById(id);

      const emailHTML = await decodeEmailAndReturnHTML(fullEmail, content);
      console.log("> [mail-robot] - Returning email in html format");

      return emailHTML;
    } catch (err) {
      console.log("> [mail-robot] Error on get email data: ", err);
      throw new Error("Error on get email data.");
    }

    async function getMailById(id: string) {
      return new Promise(async (resolve, reject) => {
        console.log(`> [mail-robot] - Getting data of email with id ${id}`);
        const fullEmail = await Gmail.users.messages.get({
          userId: "me",
          id: id,
          format: "full",
        });

        if (fullEmail.status !== 200)
          reject(new Error("Failed on get full email."));

        resolve(fullEmail.data);
      });
    }

    async function decodeEmailAndReturnHTML(email: any, content: any): Promise<string> {
      return new Promise(async (resolve, reject) => {
        const headers = email.payload.headers;

        const Date = await headers.find((item: any) => item.name === "Date");
        content.source.data = Date.value || "";

        const From = await headers.find((item: any) => item.name === "From");
        

        content.source.origin = From.value.match(/(?<=<)(.*?)(?=>)/)[0] || "";
        content.source.name = From.value.match(/(?<=")(.*?)(?=")/)[0] || "";

        const Subject = await headers.find((item: any) => item.name === "Subject");

        content.source.title = Subject.value || "";

        const fullEmailBody = email.payload?.parts[1]?.body?.data;

        if (fullEmailBody) {
          const emailHTML = base64url.decode(fullEmailBody);
          resolve(String(emailHTML));
        }
        reject({ message: "Error on decode and return email html." });
      });
    }
  }

  function breakEmailIntoNews(email: string, content: any) {
    const $ = cheerio.load(email);

    content.source.body = $.html();

    const fillByTag = {
      tag(Obj: any, news: news) {
        if (Obj.name === "a") news.link = Obj.attribs.href;
        if (Obj.name === "strong") news.title = $(Obj).text().replace(/:$/, "");
      },
      text(Obj: any, news: news) {
        const text = $(Obj)
          .text()
          // .replace(/(\n+\t+)|(^\s|\s$)/g, "");
          .replace(/\r?\n|\r|^\s+|\s+$/g, '')
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
