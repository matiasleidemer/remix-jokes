import { useLoaderData, Link, useCatch } from "remix";
import stylesUrl from "~/styles/jokes.css";
import { db } from "~/utils/db.server";

import type { LinksFunction, LoaderFunction } from "remix";
import type { Joke } from "@prisma/client";

type RandomJoke = { joke: Joke };

export let loader: LoaderFunction = async () => {
  let count = await db.joke.count();
  let randomRowNumber = Math.floor(Math.random() * count);

  let [randomJoke] = await db.joke.findMany({
    select: { content: true, name: true, id: true },
    take: 1,
    skip: randomRowNumber,
  });

  if (!randomJoke) {
    throw new Response("No random joke found", {
      status: 404,
    });
  }

  return { joke: randomJoke };
};

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export default function JokesIndexRoute() {
  const { joke } = useLoaderData<RandomJoke>();

  return (
    <div>
      <p>Here's a random joke:</p>
      <p>
        <q>{joke.content}</q>
      </p>
      <Link to={`/jokes/${joke.id}`}>
        <q>{joke.name}</q> Permalink
      </Link>
    </div>
  );
}

export function CatchBoundary() {
  let caught = useCatch();

  if (caught.status === 404) {
    return (
      <div className="error-container">There are no jokes to display.</div>
    );
  }
  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export function ErrorBoundary() {
  return <div className="error-container">I did a whoopsies.</div>;
}
