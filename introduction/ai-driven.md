# Working with AI Agents

Skapi works smoothly with CLI-based AI coding tools, such as Claude Code, OpenAI Codex, and Gemini CLI.

If you are building your project with an AI coding agent, use the system prompt file below to help it understand how to integrate the Skapi API.

### 1. Download the system prompt file for your tool

Every tool reads the same file under its own name. Pick your tool, and the file downloads with the name it expects. Put it in the root of your project.

<AgentPromptDownloads />

Browsers drop the leading dot from a download name, so `.cursorrules` and `.windsurfrules` are saved as `cursorrules` and `windsurfrules`. Add the dot back after saving.

You can also download the plain <a href="/SKAPI.md" download="SKAPI.md">SKAPI.md</a> and rename it yourself. Your project's page at [skapi.com](https://www.skapi.com) offers the same downloads, next to a prompt with your project ID filled in.

### 2. Start writing prompts

When you run your AI coding agent, start with a prompt like this:

```text
My Skapi project ID is: "<Project ID>".
Build me a [describe what you want].
```

Replace the placeholder `<Project ID>` with your actual project ID before running your prompt.
