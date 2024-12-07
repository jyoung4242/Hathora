import { Region } from "@hathora/cloud-sdk-typescript/models/components/region";
import { client } from "../main";
import { LobbyVisibility } from "@hathora/cloud-sdk-typescript/models/components/lobbyvisibility";
import { HathoraLobbyConfig } from "../Lib/HathoraPlugin";
import { LobbyV3 } from "@hathora/cloud-sdk-typescript/models/components";

export const model = {
  roomObject: undefined as any,
  roomId: "enter RoomId",
  lobbies: [] as LobbyV3[],
  makeEnemey: async () => {
    client.sendJson({
      type: "makeEnemy",
      data: {},
    });
  },
  login: async () => {
    let loginId = await client.loginAnonymous();
    console.log(loginId);
  },
  getLobbies: async () => {
    let lobbies = await client.fetchPublicLobbies();
    console.log(lobbies);
  },
  getPrivateLobbies: async (e: any, m: any) => {
    let lobbies = await client.fetchPrivateLocalLobbies();
    m.lobbies = [...lobbies];
    console.log(lobbies);
  },
  createLobby: async () => {
    let lobbyConfig: HathoraLobbyConfig = {
      region: Region.Chicago,
      visibility: LobbyVisibility.Local,
      roomConfig: {
        maxPlayers: 4,
      },
    };
    let room = await client.createLobby(lobbyConfig);
    model.roomObject = room;
    model.roomId = room.roomId;
    console.log(room);
  },
  joinRoom: async (e: any, m: any) => {
    if (m.roomId == "" || m.roomId == "enter RoomId") return;
    let room = await client.getLobbyInfo(m.roomId);
    console.log("attempting to join room: ", room);
    await client.joinLobby(room);
    console.log("joined room: ", m.roomId);
  },
  pingServer: async () => {
    client.sendJson({
      type: "ping",
      data: `echo ${client.userId}`,
    });
  },
};

export const template = `
<style> 
    canvas{ 
        position: fixed; 
        top:50%; 
        left:50%; 
        transform: translate(-50% , -50%);
    }
</style> 
<div> 
    <canvas id='cnv'> </canvas> 
    <button \${click@=>login}>Login</button>
    <button \${click@=>getLobbies}>Get Lobbies</button>
    <button \${click@=>getPrivateLobbies}>Get Private Lobbies</button>
    <button \${click@=>createLobby}>Make Room</button>
    <button \${click@=>joinRoom}>Join Room</button>
    <button \${click@=>pingServer}>Ping Server</button>
    <button \${click@=>makeEnemey}>Generate Enemy</button>
    <input type="text" \${value<=>roomId}/>
</div>`;
