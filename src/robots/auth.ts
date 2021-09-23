import express, { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";

import { gmail_v1, google, youtube_v3 } from "googleapis";
const OAuth2 = google.auth.OAuth2;

let OAuthClient: OAuth2Client;
let GmailInstance: gmail_v1.Gmail;
let YoutubeInstance: youtube_v3.Youtube;

let tokens;

async function startOAuthAuthentication() {
  const { app, server } = await startWebServer();
  OAuthClient = await createOAuthClient();
  requestUserConsent(OAuthClient);
  const authorizationToken = await waitForGoogleCallback(app);
  await requestGoogleForAccessTokens(OAuthClient, authorizationToken);
  await setGlobalGoogleAuthentication(OAuthClient);
  await stopWebServer(server);

  async function startWebServer(): Promise<{ app: any; server: any }> {
    return new Promise((resolve, reject) => {
      const port = 5000;
      const app = express();

      const server = app.listen(port, () => {
        console.log(
          `> [auth-service] Listening on ${process.env.HOST}:${port}`
        );

        resolve({
          app,
          server,
        });
      });
    });
  }

  async function createOAuthClient() {
    const credentials = require("../credentials/google-credentials");

    const OAuthClient = new OAuth2(
      credentials.web.client_id,
      credentials.web.client_secret,
      credentials.web.redirect_uris[0]
    );

    return OAuthClient;
  }

  function requestUserConsent(OAuthClient: any) {
    const scopes = [
      "https://mail.google.com",
      "https://www.googleapis.com/auth/youtube",
    ];
    const consentUrl = OAuthClient.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
    });

    console.log(`> [auth-service] Please give your consent: ${consentUrl}`);
  }

  async function waitForGoogleCallback(app: any) {
    return new Promise((resolve, reject) => {
      console.log("> [auth-service] Waiting for user consent...");

      app.get("/oauth2callback", (req: Request, res: Response) => {
        const authCode = req.query.code;
        console.log(`> [auth-service] Consent given: ${authCode}`);

        res.send("<h1>Obrigado!</h1><p>Você já pode fechar esta tela.</p>");
        resolve(authCode);
      });
    });
  }

  async function requestGoogleForAccessTokens(
    OAuthClient: any,
    authorizationToken: any
  ) {
    return new Promise<void>((resolve, reject) => {
      OAuthClient.getToken(authorizationToken, (error: any, tokens: any) => {
        if (error) {
          return reject(error);
        }

        // Preciso salvar esse token localmente
        tokens = tokens;
        console.log("> [auth-service] Access tokens received!");

        OAuthClient.setCredentials(tokens);
        resolve();
      });
    });
  }

  function setGlobalGoogleAuthentication(OAuthClient: any) {
    google.options({
      auth: OAuthClient,
    });
  }

  async function stopWebServer(server: any) {
    return new Promise<void>((resolve, reject) => {
      server.close(() => {
        resolve();
      });
    });
  }
}

function getGmailInstance() {
  if (GmailInstance === null || GmailInstance === undefined)
    GmailInstance = google.gmail({ version: "v1", auth: OAuthClient });

  return GmailInstance;
}

function getYoutubeInstance() {
  if (YoutubeInstance === null || YoutubeInstance === undefined)
    YoutubeInstance = google.youtube({ version: "v3", auth: OAuthClient });

  return YoutubeInstance;
}

export { startOAuthAuthentication, getGmailInstance, getYoutubeInstance };
