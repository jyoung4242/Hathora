/**********************************************************************************
The HathoraPlugin.ts module provides a set of interfaces and classes related to 
integration with the Hathora platform. It allows developers to easily connect 
their game to the Hathora server and interact with the platform's features such 
as lobbies, matchmaking, and player management.

Interfaces

HathoraClientConfig: This interface defines the configuration options for the 
Hathora client. It includes the appId of the game, the connectionDetails for 
establishing a connection with the server, and an updateCallback function that 
will be called whenever there is an update from the server.

Connection Details: This interface defines the details required to establish a 
connection with the server. It includes the host, port, and protocol of the 
server.

export declare type ConnectionDetails = {
    host: string;
    port: number;
    transportType: "tcp" | "tls" | "udp";
};

HathoraLobbyConfig: This interface defines the configuration options for creating
 a lobby. It includes the region where the lobby will be hosted, the visibility of
 the lobby, and other optional parameters.

Classes

ExcaliburHathoraClient: This class extends the HathoraConnection class from the 
Hathora client SDK and provides additional functionality specific to the Excalibur
game engine. It includes methods for creating and managing lobbies, joining and 
leaving lobbies, and handling player events.

Overall, HathoraPlugin.ts simplifies the integration of Hathora features into an 
Excalibur game by providing a convenient API for creating and managing lobbies, 
handling player events, and interacting with the Hathora server.

Client Process:
1. Create a new ExcaliburHathoraClient instance with the necessary configuration options.
2. Use the Authentication methods to authenticate the player.
3. Use the Lobby methods to find lobbies, create lobbies, join lobbies, and leave lobbies.
4. Use the client to send and receive data from the server.

*/

import { HathoraCloud } from "@hathora/cloud-sdk-typescript";
import { HathoraConnection, ConnectionDetails } from "@hathora/client-sdk";
import {
  Region,
  LobbyVisibility,
  PlayerTokenObject,
  LobbyV3,
  ConnectionInfoV2,
} from "@hathora/cloud-sdk-typescript/models/components";

export interface HathoraClientConfig {
  appId: string;
  connectionDetails: ConnectionDetails;
  updateCallback: (data: any) => void;
}

export interface HathoraLobbyConfig {
  region: Region;
  visibility: LobbyVisibility;
  roomConfig?: any;
}

export class ExcaliburHathoraClient {
  hathoraSDK: HathoraCloud;
  appId: string;
  lobbyService;
  roomService;
  authService;
  loginResponse: PlayerTokenObject | null = null;
  publicLobbies: LobbyV3[] = [];
  connectionInfo: ConnectionInfoV2 | null = null;
  connection: HathoraConnection | null = null;
  roomId: string | null = null;
  connectionDetails: ConnectionDetails;
  updateCallback: (data: any) => void;

  constructor(clientConfig: HathoraClientConfig) {
    this.hathoraSDK = new HathoraCloud({
      appId: clientConfig.appId,
    });
    this.appId = clientConfig.appId;
    this.lobbyService = this.hathoraSDK.lobbiesV3;
    this.roomService = this.hathoraSDK.roomsV2;
    this.authService = this.hathoraSDK.authV1;
    this.connectionDetails = clientConfig.connectionDetails;
    this.updateCallback = clientConfig.updateCallback;
  }

  /************************
  Authentication Methods
  ************************/

  async loginAnonymous() {
    this.loginResponse = await this.authService.loginAnonymous();
    return this.loginResponse;
  }

  async loginGoogle(googleId: string) {
    this.loginResponse = await this.authService.loginGoogle({ idToken: googleId });
    return this.loginResponse;
  }

  async loginNickName(nickName: string) {
    this.loginResponse = await this.authService.loginNickname({ nickname: nickName });
    return this.loginResponse;
  }

  /************************
  Lobby Methods
  ************************/
  async createLobby(lobbyConfig: HathoraLobbyConfig): Promise<LobbyV3> {
    if (this.loginResponse === null) {
      throw new Error("No user logged in");
    }
    let roomConfig;
    lobbyConfig.roomConfig ? (roomConfig = lobbyConfig.roomConfig) : (roomConfig = {});

    return await this.lobbyService.createLobby(
      {
        playerAuth: this.loginResponse?.token as string,
      },
      {
        region: lobbyConfig.region,
        visibility: lobbyConfig.visibility,
        roomConfig: JSON.stringify(roomConfig),
      },
      this.appId
    );
  }

  async fetchPublicLobbies(): Promise<LobbyV3[]> {
    this.publicLobbies = await this.lobbyService.listActivePublicLobbies(this.appId);
    return this.publicLobbies;
  }

  async getLobbyInfo(roomId: string): Promise<LobbyV3> {
    return await this.lobbyService.getLobbyInfoByRoomId(roomId, this.appId);
  }

  async joinLobby(roomId: string) {
    if (this.loginResponse === null) {
      throw new Error("No user logged in");
    }
    this.connectionInfo = await this.roomService.getConnectionInfo(roomId);

    if (this.connectionInfo.roomId) {
      this.roomId = this.connectionInfo.roomId;
      this.connection = new HathoraConnection(this.roomId, this.connectionDetails);
      await this.connection.connect(this.loginResponse.token);
      this.connection.onMessage((event: ArrayBuffer) => {
        this.updateCallback(event);
      });
      this.connection.onMessageString((event: string) => {
        this.updateCallback(event);
      });
      this.connection.onMessageJson((event: any) => {
        this.updateCallback(event);
      });
      this.connection.onClose((e: any) => {
        this.connection = null;
        this.roomId = null;
        this.connectionInfo = null;
      });
    }
  }

  async leaveLobby() {
    if (!this.connectionInfo?.roomId) return;
    if (!this.roomId) return;
    if (this.connectionInfo?.roomId) {
      this.connection?.disconnect();
    }
  }

  /************************
  Sending Data
  ************************/
  send(data: any) {
    if (!this.connectionInfo?.roomId) return;
    if (!this.roomId) return;
    if (this.connectionInfo?.roomId) {
      this.connection?.write(data);
    }
  }

  sendString(data: string) {
    if (!this.connectionInfo?.roomId) return;
    if (!this.roomId) return;
    if (this.connectionInfo?.roomId) {
      this.connection?.writeString(data);
    }
  }

  sendJson(data: any) {
    if (!this.connectionInfo?.roomId) return;
    if (!this.roomId) return;
    if (this.connectionInfo?.roomId) {
      this.connection?.writeJson(data);
    }
  }
}
