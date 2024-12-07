// main.ts
import "./style.css";

import { UI } from "@peasy-lib/peasy-ui";
import { Engine, DisplayMode, Vector, KeyEvent, Keys, Scene } from "excalibur";
import { model, template } from "./UI/UI";
import { ExcaliburHathoraClient, HathoraClientConfig } from "./Lib/HathoraPlugin";
import { Player } from "./Actors/player";
import { dir } from "console";

class myScene extends Scene {
  constructor() {
    super();
  }

  onInitialize(engine: Engine): void {
    console.log("initialize");

    game.input.keyboard.on("press", (e: KeyEvent) => {
      console.log("key: ", e.key);

      let direction: "left" | "right" | "up" | "down" | "none" = "none";
      if (e.key === Keys.Left) {
        direction = "left";
      }
      if (e.key === Keys.Right) {
        direction = "right";
      }
      if (e.key === Keys.Up) {
        direction = "up";
      }
      if (e.key === Keys.Down) {
        direction = "down";
      }

      client.sendJson({
        type: "keydown",
        direction,
      });
    });
    game.input.keyboard.on("release", (e: KeyEvent) => {
      console.log("key: ", e.key);

      let direction: "left" | "right" | "up" | "down" | "none" = "none";
      if (e.key === Keys.Left) {
        direction = "left";
      }
      if (e.key === Keys.Right) {
        direction = "right";
      }
      if (e.key === Keys.Up) {
        direction = "up";
      }
      if (e.key === Keys.Down) {
        direction = "down";
      }

      client.sendJson({
        type: "keyup",
        direction,
      });
    });
  }
}

let appId = "app-6b60b294-789f-41a3-a67e-5f40baf27768";
const clientConfig: HathoraClientConfig = {
  appId,
  connectionDetails: {
    host: "localhost",
    port: 8000,
    transportType: "tcp",
  },
  updateCallback: (data: any) => {
    switch (data.type) {
      case "createEntity": {
        //TODO add group of entities
        console.log("createEntity: ", data.data.entities);
        let newEntities = [...data.data.entities];
        //loop through entities and find any not already in the game
        let currentEntities = game.currentScene.entities;
        for (let newEntity of newEntities) {
          let localEntity = currentEntities.find(entity => {
            return (entity as Player).uuid === newEntity.id;
          });
          if (localEntity != undefined) {
            continue;
          }

          //create the new entity
          let name = newEntity;
          let position = new Vector(newEntity.position.x, newEntity.position.y);
          let color = newEntity.color;
          let uuid = newEntity.id;
          let entityToAdd = new Player(name, position, color, uuid);
          game.add(entityToAdd);
        }

        break;
      }
      case "update": {
        const localEntties = game.currentScene.entities;

        for (let i = 0; i < data.data.length; i++) {
          const localEntity = localEntties.find(entity => {
            //console.log("entity: ", (entity as Player).uuid);
            //console.log("data.data: ", data.data[i].id);
            return (entity as Player).uuid === data.data[i].id;
          });
          //console.log("local entity: ", localEntity);

          if (localEntity != undefined) {
            //console.log("update: ", data.data);
            let newVector = new Vector(data.data[i].position.x, data.data[i].position.y);
            //console.log("new vector: ", newVector);

            (localEntity as Player).tComponent.pos = newVector;
          }
        }

        break;
      }
    }
  },
};
export const client = new ExcaliburHathoraClient(clientConfig);
await UI.create(document.body, model, template).attached;

const game = new Engine({
  width: 800, // the width of the canvas
  height: 600, // the height of the canvas
  canvasElementId: "cnv", // the DOM canvas element ID, if you are providing your own
  displayMode: DisplayMode.Fixed, // the display mode
  pixelArt: true,
  scenes: {
    main: new myScene(),
  },
});

console.log(client);

await game.start();
game.goToScene("main");
