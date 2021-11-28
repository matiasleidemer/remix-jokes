import type { LinksFunction } from "remix";

import stylesUrl from "../../styles/jokes.css";

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export default function JokesIndexRoute() {
  return (
    <div className="foo bar baz">
      <p>Here's a random joke:</p>
      <p>I was wondering why the frisbee was getting bigger, then it hit me.</p>
    </div>
  );
}
