import { truncateTables } from "./truncate-tables";

export default async function globalSetup(): Promise<void> {
  console.log('Running global setup once before anything...');
  await truncateTables();
}