import { loadState, saveState } from "./state";

import sbd from "sbd";

const watsonCredentials = require("../credentials/watson-nlu");

import NaturalLanguageUnderstandingV1 from "ibm-watson/natural-language-understanding/v1";
import { IamAuthenticator } from "ibm-watson/auth";

const nlu = new NaturalLanguageUnderstandingV1({
  authenticator: new IamAuthenticator({ apikey: watsonCredentials.apikey }),
  version: "2018-04-05",
  serviceUrl:
    "https://api.us-south.natural-language-understanding.watson.cloud.ibm.com",
});

async function textRobot() {
  const state = loadState();

  breakContentIntoSentences();

  await fetchKeywordsOfAllSentences();

  saveState(state);

  function breakContentIntoSentences() {
    console.log(`> [text-robot] - Breaking news into sentences`);

    for (const index in state.news) {
      const news = state.news[index];
      const sentences = sbd.sentences(news.body);
      sentences.unshift(news.title);

      sentences.forEach((sentence, sentenceId) => {
        state.news[index].sentences.push({
          id: sentenceId + 1,
          text: sentence,
          keywords: [],
          images: [],
        });
      });
    }
  }

  async function fetchWatsonAndReturnKeywords(sentence: string) {
    try{
      
    const request = await nlu.analyze({
      text: sentence,
      features: {
        keywords: {},
      },
    });

    const keywords = request.result.keywords?.map((keyword) => keyword.text);

    return keywords;
    
  } catch(err) {
    console.error(err)
    return []
  }
  }

  async function fetchKeywordsOfAllSentences() {
    console.log(`> [text-robot] - Fetching keywords to all news sentences`);

    for (const index in state.news) {
      const sentences = state.news[index].sentences;

      for (const sentenceId in sentences) {
        const sentence = sentences[sentenceId]
        state.news[index].sentences[sentenceId].keywords = await fetchWatsonAndReturnKeywords(
          sentence.text
        );
      }
    }
  }
}

export default textRobot;
