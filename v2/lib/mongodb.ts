import { MongoClient, type Collection, type Document } from "mongodb";

const uri = process.env.MONGODB_URI;
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}
let clientPromise: Promise<MongoClient> | undefined;

function getClientPromise() {
  if (!uri) throw new Error("MONGODB_URI is not configured.");
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) global._mongoClientPromise = new MongoClient(uri).connect();
    return global._mongoClientPromise;
  }
  if (!clientPromise) clientPromise = new MongoClient(uri).connect();
  return clientPromise;
}

export async function getCollection<T extends Document = Document>(name = "posts"): Promise<Collection<T>> {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB || "iyanu_publication").collection<T>(name);
}
