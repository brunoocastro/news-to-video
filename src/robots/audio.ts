import path from "path";
import Say from "say";
import { loadState } from "./state";

async function audioRobot() {
  const state = loadState();

  await fetchSentencesToGenerateAudio(state);

  return

  async function fetchSentencesToGenerateAudio(state: any) {
    console.log(`> [audio-robot] - Fetching sentences to generate audio files`);

    for (const newsIndex in state.news) {
      const sentences = state.news[newsIndex].sentences;

      for (const sentenceIndex in sentences) {
        const sentence = sentences[sentenceIndex];

        await generateAndSaveAudio(sentence.text, newsIndex, sentenceIndex);
      }
    }
  }

  async function generateAndSaveAudio(
    text: string,
    newsIndex: string,
    sentenceIndex: string
  ) {
    const filename = `/${newsIndex}-${sentenceIndex}-original.mp3`;
    const filepath = path.resolve("src", "storage", "audio");

    const fileAudioDest = filepath + filename;

    const textNormalized = text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const voice = undefined;

    Say.export(textNormalized, voice, 1.25, fileAudioDest, (err) => {
      if (err) {
        return console.error(err);
      }

      console.log(`> [audio-robot] - Audio gerado e salvo em ${fileAudioDest}`);
      return;
    });
  }
}

export default audioRobot;
