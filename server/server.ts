import { HathoraCloud } from "@hathora/cloud-sdk-typescript";

const cloud = new HathoraCloud({
  appId: process.env.APP_ID as string,
});
