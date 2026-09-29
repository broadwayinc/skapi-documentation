# Working with AI Agents

Skapi works smoothly with AI coding tools, such as Claude Code, Codex CLI, Gemini CLI, GitHub Copilot, Cursor and Windsurf.

There are two ways an AI agent can help you build on Skapi, and they work well together:

- A **prompt file** in your project teaches the agent how to write code against the Skapi API.
- The **Skapi MCP server** lets the agent work on your project itself: your database, your settings, your tickets, your secret keys and more, signed in as you.

## 1. Download the prompt file for your tool

Every tool reads the same file under its own name. Pick your tool, and the file downloads with the name it expects. Put it in the root of your project.

<AgentPromptDownloads />

Browsers drop the leading dot from a download name, so `.cursorrules` and `.windsurfrules` are saved as `cursorrules` and `windsurfrules`. Add the dot back after saving.

You can also download the plain <a href="/SKAPI.md" download="SKAPI.md">SKAPI.md</a> and rename it yourself.

Your project's `Settings` page at [skapi.com](https://www.skapi.com) offers the same downloads under **For AI Agents**, next to the opening prompt with your project ID already filled in. Click **[Download]** on the row of your tool, and click the prompt to copy it.

![The For AI Agents card on a project's Settings page: the opening prompt with the project ID filled in, and one Download row per tool, from Claude Code to Windsurf](/screenshots/settings-agents.webp)

*The For AI Agents card on the Settings page. The file is the same for every tool; only its name differs.*

Your project ID is on the same page, under **Information**. Click it to copy it.

![The Information card on a project's Settings page, with the Project ID, Owner ID, Service ID, Region, creation date and a link to the documentation](/screenshots/settings-information.webp)

*The Information card. The Project ID is what `new Skapi()` takes.*

## 2. Start writing prompts

When you run your AI coding agent, start with a prompt like this:

```text
My Skapi project ID is: "<Project ID>".
Build me a [describe what you want].
```

Replace the placeholder `<Project ID>` with your actual project ID before running your prompt.

## Connecting the Skapi MCP server

The Skapi MCP server connects an AI agent to your Skapi projects. Once connected, the agent can read and change your project as you, so the tedious parts of setting a project up become a sentence in a prompt.

1. Add this MCP endpoint to your AI platform:

   **https://mcp.broadwayinc.computer**

2. Choose OAuth. No client ID or client secret is needed.

3. Sign in with your Skapi account when the platform asks.

Any platform that speaks MCP works. The endpoint is the same everywhere; only the place you put it differs.

### Coding agents

Each of these opens your browser to sign you in with your Skapi account the first time the agent uses the server. Leave any client ID or client secret field empty.

::: code-group

```sh [Claude Code]
claude mcp add --transport http skapi https://mcp.broadwayinc.computer
```

```sh [Codex CLI]
codex mcp add skapi --url https://mcp.broadwayinc.computer
codex mcp login skapi
```

```sh [Gemini CLI]
gemini mcp add --transport http skapi https://mcp.broadwayinc.computer
```

```json [Cursor]
{
  "mcpServers": {
    "skapi": { "url": "https://mcp.broadwayinc.computer" }
  }
}
```

```json [VS Code / Copilot]
{
  "servers": {
    "skapi": { "type": "http", "url": "https://mcp.broadwayinc.computer" }
  }
}
```

```json [Windsurf]
{
  "mcpServers": {
    "skapi": { "serverUrl": "https://mcp.broadwayinc.computer" }
  }
}
```

:::

| Platform | Where it goes | Signing in |
| --- | --- | --- |
| Claude Code | The command above. Add `--scope user` to have the server in every project. | Automatic. Run `/mcp` in a session, or `claude mcp login skapi`, if it has not asked yet. |
| Codex CLI | The command above writes `[mcp_servers.skapi]` with `url` into `~/.codex/config.toml`. | `codex mcp login skapi` |
| Gemini CLI | The command above writes `httpUrl` into `.gemini/settings.json`. Add `-s user` to have the server in every project. | Automatic. `/mcp auth skapi` in a session starts it again. |
| Cursor | `.cursor/mcp.json` in the project, or `~/.cursor/mcp.json` for every project. The Customize page manages the same list. | Prompted in the browser |
| VS Code with GitHub Copilot | `.vscode/mcp.json`, or Command Palette, **MCP: Add Server**. | Prompted in the browser on first connection |
| Windsurf, now Devin Desktop | `~/.config/devin/mcp_config.json`, opened from the MCPs entry of the Cascade panel's menu. The Devin CLI also takes `devin mcp add skapi https://mcp.broadwayinc.computer`. | Prompted in the browser, or `devin mcp login skapi` |

### Chat platforms on the web

A web platform has no command line, so the server is added in its settings instead, usually on a page called Connectors, Integrations, Apps or MCP servers. Look for an option to add a custom or remote server, paste the endpoint, leave the client ID and secret empty, and sign in when it asks.

- **Claude** (claude.ai, the desktop app and Cowork): **Customize > Connectors**, then **Add custom connector**. Paste the endpoint and click **Add**. On Team and Enterprise plans an organization owner adds it under **Organization settings > Connectors**, and every member clicks **Connect**.
- **ChatGPT**: turn on **Developer mode** under **Settings > Security and login**, open **chatgpt.com/plugins**, click **+**, give it a name and paste the endpoint as the connection. In a chat, choose **Developer mode** from the **+** menu and pick it. Available on the paid plans.

Other platforms follow the same pattern. Zed, JetBrains AI Assistant, Cline, Kiro and Amp all take a remote MCP server by URL from their settings page or their config file. Wherever a platform asks for a transport, choose **Streamable HTTP**; wherever it asks how to authenticate, choose **OAuth**.

Then tell the agent which project to work on:

```text
Use my Skapi project "<Project ID>".
```

You can also ask it to list your projects and pick one.

## What the MCP server can do for you

Everything below runs with the permissions of your signed-in Skapi account, so the agent can only reach what you can, and every change it makes is one you could have made on the dashboard yourself.

- **Tickets.** Register the endpoints that accept a webhook from your payment provider, a link, or a signed-in request, with their conditions, placeholders, actions and error handling, and read their logs afterwards. See [Registering a Ticket](/tickets/introduction.md).
- **Secret keys.** Store the API keys of the third-party services your project calls, so your front end never holds them. See [Secret Keys](/api-bridge/client-secret-request.md).
- **OpenID loggers.** Set up sign-in through an external identity provider, including the profile request and the header it needs. See [OpenID Login](/authentication/openid-login.md).
- **Database.** Read, search, create, update and delete records. List tables, tags and indexes.
- **Project settings.** Turn sign-ups or inquiries on and off, restrict anonymous writes, and change the other settings of the project.
- **Hosting.** Register a web address, then upload, edit and delete the files of your project's website.

The ticket, secret key and OpenID logger pages of this documentation each show the dashboard forms these tools fill in for you. A few prompts to start with:

```text
Save this API key as a secret named "weather_api": <your key>.
Create a ticket that saves each incoming webhook payload to the "orders" table.
Register a Google OpenID logger for this project.
Show me what my "orders" ticket received today.
Make every record in the "posts" table private.
```

The agent picks the tools, asks when something is missing, and reports what it changed.
