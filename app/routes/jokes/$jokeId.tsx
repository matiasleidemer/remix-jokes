import { useLoaderData, Link } from "remix";
import { db } from "~/utils/db.server";

import type { LoaderFunction } from "remix";
import type { Joke } from "@prisma/client";

type LoaderData = { joke: Pick<Joke, "content" | "name"> };

export let loader: LoaderFunction = async ({ params }) => {
  const { jokeId } = params;
  const joke = await db.joke.findUnique({
    where: { id: jokeId },
    select: { content: true, name: true },
  });

  if (!joke) throw new Error("Joke not found!");

  return { joke };
};

export default function JokeRoute() {
  const { joke } = useLoaderData<LoaderData>();

  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>
        <q>{joke.content}</q>
      </p>
      <Link to=".">{joke.name} Permalink</Link>
    </div>
  );
}
