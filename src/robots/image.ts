import { getCustomSearchInstance } from "./auth";
import { loadState, saveState } from "./state";

async function imageRobot() {
  const state = loadState();
  const customSearch = getCustomSearchInstance();

  await fetchImagesOfAllSentences();

  saveState(state)

  async function fetchImagesOfAllSentences() {
    console.log(`> [image-robot] - Fetching images to all news sentences`);

    for (const index in state.news) {
      const sentences = state.news[index].sentences;

      for (const sentenceId in sentences) {
        const sentence = sentences[sentenceId];
        let query = "";
        if (sentence.keywords.length >= 2)
          query = `${sentence.keywords[0]} ${sentence.keywords[1]}`;
        else if (sentence.keywords.length === 1)
          query = `${sentence.keywords[0]}`;
        else query = sentence.text;

        state.news[index].sentences[sentenceId].imgSearchText = query;
        state.news[index].sentences[sentenceId].images =
          await fetchGoogleAndReturnImageLinks(query);
      }
    }

    console.log(
      `> [image-robot] - Fetching images to all advertising sentences`
    );

    for (const index in state.advertising) {
      const sentences = state.advertising[index].sentences;

      for (const sentenceId in sentences) {
        const sentence = sentences[sentenceId];
        let query = "";
        if (sentence.keywords.length >= 2)
          query = `${sentence.keywords[0]} ${sentence.keywords[1]}`;
        else if (sentence.keywords.length === 1)
          query = `${sentence.keywords[0]}`;
        else query = sentence.text;

        state.advertising[index].sentences[sentenceId].images =
          await fetchGoogleAndReturnImageLinks(query);
      }
    }

    async function fetchGoogleAndReturnImageLinks(
      query: string,
      full: boolean = false
    ) {
      try {
        const credentials = require("../credentials/google-search");
        const imgSizeStyle = full ? "HUGE	" : "ImgSizeUndefined";
        const response = await customSearch.cse.list({
          auth: credentials.apikey,
          cx: credentials.engineId,
          q: query,
          searchType: "image",
          num: 2,
          imgSize: imgSizeStyle,
        });

        const imagesUrl = response.data.items?.map((item) => item.link);

        return imagesUrl;
      } catch (error) {
        console.error(error);
        return [];
      }
    }
  }
}
export default imageRobot;
