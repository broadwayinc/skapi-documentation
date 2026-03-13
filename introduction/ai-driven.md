# Working with AI Assistants

Skapi works smoothly with CLI-based AI coding assistants, such as Claude Code, OpenAI Codex, and Gemini CLI.

If you are building your project with an AI coding assistant, use the system prompt file below to help it understand how to integrate the Skapi API.

### 1. Download the system prompt file

<a href="https://docs.skapi.com/SKAPI.md" download="SKAPI.md">⬇️ SKAPI.md (Click to Download)</a>

### 2. Rename and add it to your project folder

Rename the downloaded `SKAPI.md` file to the filename your tool expects, then place it in your project root.

Examples:

- `AGENT.md` for OpenAI Codex
- `CLAUDE.md` for Anthropic Claude
- `GEMINI.md` for Gemini CLI

### 3. Start writing prompts

When you run your coding assistant, start with a prompt like this:

```
My Skapi service ID is: "s1_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxx".
Build me a [describe what you want].
```

Replace the placeholder service ID with your actual service ID before running your prompt.