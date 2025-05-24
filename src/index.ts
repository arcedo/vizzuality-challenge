import { Server } from "./presentation/Server";

const PORT = 3000;

export async function main(): Promise<void> {
  await Server.run(PORT);
}

main();
