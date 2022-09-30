import { Hono } from "hono";
import { html } from "hono/html";
import { jsx } from "hono/jsx";

interface Env {
  TODOS: KVNamespace;
}

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

const PREFIX = "todo:v1:";

const app = new Hono<{ Bindings: Env }>();

type Todo = {
  id: string;
  text: string;
};

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

app.get("/todos", async (c) => {
  const list = await c.env.TODOS.list<Todo>({ prefix: PREFIX });
  const todos: Todo[] = [];
  for (const key of list.keys) {
    const t = await c.env.TODOS.get<Todo>(key.name, "json");
    if (t) {
      todos.push(t);
    }
  }

  return c.html(
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
              <li style="display: flex; gap: 12px;">
                {t.text}{" "}
                <form action={`/todos/delete/${t.id}`} method="POST">
                  <button>x</button>
                </form>
              </li>
            ))}
          </ul>
        </Layout>
      )}`
  );
});

app.post("/todos/new", async (c) => {
  const data = await c.req.parseBody();
  const newId = crypto.randomUUID();
  const newTodo: Todo = {
    id: newId,
    text: data["todo"] as string,
  };
  await c.env.TODOS.put(`${PREFIX}${newId}`, JSON.stringify(newTodo));
  return c.redirect("/todos");
});

app.post("/todos/delete/:id", async (c) => {
  const { id } = c.req.param();
  await c.env.TODOS.delete(`${PREFIX}${id}`);
  return c.redirect("/todos");
});

export default app;
