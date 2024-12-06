// main.ts
import "./style.css";

import { UI } from "@peasy-lib/peasy-ui";
import { Engine, DisplayMode } from "excalibur";
import { model, template } from "./UI/UI";

import { ExcaliburHathoraClient, HathoraClientConfig } from "./Lib/HathoraPlugin";

await UI.create(document.body, model, template).attached;

let appId = "app-6b60b294-789f-41a3-a67e-5f40baf27768";

const game = new Engine({
  width: 800, // the width of the canvas
  height: 600, // the height of the canvas
  canvasElementId: "cnv", // the DOM canvas element ID, if you are providing your own
  displayMode: DisplayMode.Fixed, // the display mode
  pixelArt: true,
});

const clientConfig: HathoraClientConfig = {
  appId,
  connectionDetails: {
    host: "localhost",
    port: 8080,
    transportType: "tcp",
  },
  updateCallback: (data: any) => {
    console.log(data);
  },
};
const client = new ExcaliburHathoraClient(clientConfig);

await game.start();
