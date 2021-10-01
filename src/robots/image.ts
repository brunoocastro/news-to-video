import { loadState } from "./state";

async function imageRobot() {
  const state = loadState()
  console.log("Carreguei o State: ", state)
}

export default imageRobot