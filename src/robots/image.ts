import imgDownloader from "image-downloader";
import path from "path";

import { getCustomSearchInstance } from "./auth";
import { loadState, saveState } from "./state";

async function imageRobot() {
  const state = loadState();
  const customSearch = getCustomSearchInstance();

  await fetchImagesOfAllSentences(customSearch);

  await downloadAllImages(state);

  console.log("Last State: \n", state);

  saveState(state);

  return;

  async function fetchImagesOfAllSentences(customSearch: any) {
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
          await fetchGoogleAndReturnImageLinks(customSearch, query);
      }
    }

    async function fetchGoogleAndReturnImageLinks(
      customSearch: any,
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

        const imagesUrl = response.data.items?.map((item: any) => item.link);

        return imagesUrl;
      } catch (error) {
        console.error(error);
        return [];
      }
    }
  }

  async function downloadAllImages(state: any) {
    state.downloadedImages = [];

    console.log(`> [image-robot] - Download images to all news sentences`);

    for (const newsIndex in state.news) {
      const sentences = state.news[newsIndex].sentences;

      for (const sentenceIndex in sentences) {
        const images = sentences[sentenceIndex].images;

        for (const imgURLIndex in images) {
          const imageURL = images[imgURLIndex];

          try {
            if (state.downloadedImages.includes(imageURL))
              throw new Error("Essa imagem já foi baixada!");

            await downloadAndSaveImage(imageURL, newsIndex, sentenceIndex);
            state.downloadedImages.push(imageURL);
            console.log(
              `> [${sentenceIndex}][${imgURLIndex}] Imagem baixada com sucesso! Link: ${imageURL}`
            );
            break;
          } catch (error) {
            console.log(
              `> [${sentenceIndex}][${imgURLIndex}] Erro ao baixar ${imageURL}. Erro: ${error}`
            );
          }
        }
      }
    }

    async function downloadAndSaveImage(
      imageURL: string,
      newsIndex: string,
      sentenceIndex: string
    ) {
      const filename = `/${newsIndex}-${sentenceIndex}-original.png`;
      const filepath = path.resolve("src", "storage", "images");

      const fileImageDest = filepath + filename;

      return imgDownloader.image({
        url: imageURL,
        dest: fileImageDest,
      });
    }
  }
}
export default imageRobot;
