import { HathoraCloud } from "@hathora/cloud-sdk-typescript";
import { Application, RoomId, startServer, UserId, verifyJwt } from "@hathora/server-sdk";
import dotenv from "dotenv";
import { Enemy, Entity, EntityType, Vector } from "./entity";
dotenv.config();
const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");

interface RoomState {
  players: string[];
  entities: Entity[];
}

const rooms: Record<string, RoomState> = {};

const hathoraSdk = new HathoraCloud({
  appId: process.env.HATHORA_APP_ID,
});

console.log("hathora sdk: ", hathoraSdk);
console.log("appid: ", process.env.HATHORA_APP_ID);

const appService = hathoraSdk.appsV2;

const game: Application = {
  async verifyToken(token, roomId): Promise<UserId | undefined> {
    const userId = verifyJwt(token, process.env.HATHORA_APP_SECRET!);
    if (userId === undefined) {
      console.error("Failed to verify token", token);
    }
    return userId;
  },
  async subscribeUser(roomId, userId): Promise<void> {
    console.log("new user: ", roomId, userId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: [userId],
        entities: [],
      };
    } else {
      rooms[roomId].players.push(userId);
    }
    let entity = createEntity(userId, EntityType.Player, { x: 0, y: 0 });
    rooms[roomId].entities.push(entity);
    server.broadcastMessage(
      roomId,
      encoder.encode(JSON.stringify({ type: "createEntity", data: { entities: rooms[roomId].entities } }))
    );

    console.log("rooms: ", rooms);
  },

  async unsubscribeUser(roomId, userId): Promise<void> {},

  async onMessage(roomId, userId, data): Promise<void> {
    const msg = JSON.parse(decoder.decode(data));
    //console.log("onMessage: ", roomId, userId, msg);

    if (msg.type == "ping") {
      server.sendMessage(roomId, userId, encoder.encode(JSON.stringify({ type: "pong", data: msg.data })));
    } else if (msg.type == "keyup") {
      //console.log("keyup: ", roomId, userId, msg.direction);
      stopUser(roomId, userId, msg.direction);
    } else if (msg.type == "keydown") {
      console.log("keydown: ", roomId, userId, msg.direction);

      moveUser(roomId, userId, msg.direction);
    } else if (msg.type == "makeEnemy") {
      makeEnemy(roomId);
    }
  },
};

// Start the server
const port = parseInt(process.env.PORT ?? "4000");
const server = await startServer(game, port);
console.log(`Server listening on port ${port}`);

setInterval(() => {
  //state update
  for (const roomId in rooms) {
    rooms[roomId].entities.forEach(entity => {
      entity.update();
    });

    const room = rooms[roomId];
    const entities = room.entities;
    server.broadcastMessage(
      roomId,
      encoder.encode(
        JSON.stringify({
          type: "update",
          event: "update",
          data: entities,
        })
      )
    );
  }
}, 50);

function createEntity(name: string, type: EntityType, position: Vector): Entity {
  const entity = new Entity(name, type, new Vector(16, 16), position, generateRandomColor());
  return entity;
}

function makeEnemy(roomId: RoomId) {
  let position = new Vector(Math.random() * 800, Math.random() * 600);

  const entity = new Enemy(position);

  let room = rooms[roomId];
  room.entities.push(entity);
  server.broadcastMessage(
    roomId,
    encoder.encode(JSON.stringify({ type: "createEntity", data: { entities: rooms[roomId].entities } }))
  );
}

function generateRandomColor(): string {
  const randomColor = Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0");
  return `#${randomColor}`;
}

function moveUser(roomId: RoomId, userId: UserId, direction: string) {
  const room = rooms[roomId];
  const entities = room.entities;

  for (const entity of entities) {
    if (entity.name === userId) {
      if (direction === "up") {
        entity.velocity.y = -1;
      } else if (direction === "down") {
        entity.velocity.y = 1;
      } else if (direction === "left") {
        entity.velocity.x = -1;
      } else if (direction === "right") {
        entity.velocity.x = 1;
      }
    }
  }
}

function stopUser(roomId: RoomId, userId: UserId, direction: string) {
  const room = rooms[roomId];
  const entities = room.entities;

  for (const entity of entities) {
    if (entity.name === userId) {
      if (direction === "up") {
        entity.velocity.y = 0;
      } else if (direction === "down") {
        entity.velocity.y = 0;
      } else if (direction === "left") {
        entity.velocity.x = 0;
      } else if (direction === "right") {
        entity.velocity.x = 0;
      }
    }
  }
}

function newEntities(roomId: RoomId) {
  const room = rooms[roomId];
  const entities = room.entities;

  server.broadcastMessage(roomId, encoder.encode(JSON.stringify({ type: "createEntity", data: { entities } })));
}
