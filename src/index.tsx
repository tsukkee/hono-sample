import { Hono } from "hono";
import { html } from "hono/html";
import { jsx } from "hono/jsx";

const Layout = (props: { children?: string }) => {
  return (
    <html>
      <head>
        <meta coding="utf-8" />
        <title>Cloudflare Worker</title>
      </head>
      <body>{props.children}</body>
    </html>
  );
};

const app = new Hono();

type Todo = {
  id: string;
  text: string;
};

const todos: Todo[] = [];

app.get("/", (c) =>
  c.html(
    html`<!DOCTYPE html>${(
        <Layout>
          <h1>Hello Hono!?</h1>
          <div>
            <a href="/todos">ToDoだよ</a>
          </div>
        </Layout>
      )}`
  )
);

app.get("/todos", (c) =>
  c.html(
    html`<!DOCTYPE html>${(
        <Layout>
          <h1>ToDo</h1>
          <h2>追加</h2>
          <form action="/todos/new" method="POST">
            <input name="todo" />
            <input type="submit" />
          </form>
          <h2>一覧</h2>
          <ul>
            {todos.map((t) => (
              <li>
                {t.text}{" "}
                <form action={`/todos/delete/${t.id}`} method="POST">
                  <button>x</button>
                </form>
              </li>
            ))}
          </ul>
        </Layout>
      )}`
  )
);

app.post("/todos/new", async (c) => {
  const data = await c.req.parseBody();
  const newId = crypto.randomUUID();
  todos.push({
    id: newId,
    text: data["todo"] as string,
  });
  return c.redirect("/todos");
});

app.post("/todos/delete/:id", async (c) => {
  const id = c.req.param("id");
  const index = todos.findIndex((t) => t.id === id);
  if (index !== -1) {
    todos.splice(index, 1);
  }
  return c.redirect("/todos");
});

export default app;
