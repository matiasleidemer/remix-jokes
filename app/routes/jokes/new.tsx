import {
  Form,
  Link,
  redirect,
  useActionData,
  useCatch,
  useTransition,
} from "remix";
import { db } from "~/utils/db.server";
import { getUserId, requireUserId } from "~/utils/session.server";
import { JokeDisplay } from "~/components/joke";

import type { ActionFunction, LoaderFunction } from "remix";
type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
    content: string | undefined;
  };
  fields?: {
    name: string;
    content: string;
  };
};

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return `That joke is too short`;
  }
}

function validateJokeName(name: string) {
  if (name.length < 2) {
    return `That joke's name is too short`;
  }
}

export let loader: LoaderFunction = async ({ request }) => {
  let userId = await getUserId(request);

  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return {};
};

export let action: ActionFunction = async ({
  request,
}): Promise<Response | ActionData> => {
  let userId = await requireUserId(request);
  let form = await request.formData();
  let name = form.get("name");
  let content = form.get("content");

  if (typeof name !== "string" || typeof content !== "string") {
    return { formError: "Form not submitted correctly." };
  }

  let fieldErrors = {
    name: validateJokeName(name),
    content: validateJokeContent(content),
  };

  let fields = { name, content };

  if (Object.values(fieldErrors).some(Boolean)) {
    return { fieldErrors, fields };
  }

  let joke = await db.joke.create({ data: { ...fields, jokesterId: userId } });

  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
  const actionData = useActionData<ActionData | undefined>();
  const transition = useTransition();

  if (transition.submission) {
    const name = transition.submission.formData.get("name");
    const content = transition.submission.formData.get("content");

    if (
      typeof name === "string" &&
      typeof content === "string" &&
      !validateJokeContent(content) &&
      !validateJokeName(name)
    ) {
      return (
        <JokeDisplay
          joke={{ name, content }}
          isOwner={true}
          canDelete={false}
        />
      );
    }
  }

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <Form method="post">
        <div>
          <label>
            Name:{" "}
            <input
              type="text"
              name="name"
              defaultValue={actionData?.fields?.name}
              aria-invalid={Boolean(actionData?.fieldErrors?.name) || undefined}
              aria-describedby={
                actionData?.fieldErrors?.name ? "name-error" : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p className="form-validation-error" role="alert" id="name-error">
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:{" "}
            <textarea
              name="content"
              defaultValue={actionData?.fields?.content}
              aria-invalid={
                Boolean(actionData?.fieldErrors?.content) || undefined
              }
              aria-describedby={
                actionData?.fieldErrors?.content ? "content-error" : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              role="alert"
              id="content-error"
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </Form>
    </div>
  );
}

export function CatchBoundary() {
  let caught = useCatch();

  if (caught.status === 401) {
    return (
      <div className="error-container">
        <p>You must be logged in to create a joke.</p>
        <Link to="/login">Login</Link>
      </div>
    );
  }
}

export function ErrorBoundary() {
  return (
    <div className="error-container">
      Something unexpected went wrong. Sorry about that.
    </div>
  );
}
