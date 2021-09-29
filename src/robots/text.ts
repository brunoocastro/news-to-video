import { loadState, saveState } from "./state";

import sbd from "sbd";

function textRobot() {
  const state = loadState();

  breakContentIntoSentences();

  console.log('Last State: \n', state)

  saveState(state)


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

    console.log(`> [text-robot] - Breaking advertising into sentences`);
    
    for (const index in state.advertising) {
      const advertising = state.advertising[index];
      const sentences = sbd.sentences(advertising.body);
      sentences.unshift(advertising.title);

      sentences.forEach((sentence, sentenceId) => {
        state.advertising[index].sentences.push({
          id: sentenceId + 1,
          text: sentence,
          keywords: [],
          images: [],
        });
      });
    }
  }
  
}

export default textRobot;
