import { HathoraCloud } from "@hathora/cloud-sdk-typescript";

const cloud = new HathoraCloud({
  appId: process.env.HATHORA_APP_ID as string,
});
