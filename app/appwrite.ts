import { Client, Account } from "appwrite";

export const client = new Client();

client
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("6824b5530015de2f73c4"); // Replace with your project ID

export const account = new Account(client);
export { ID } from "appwrite";
