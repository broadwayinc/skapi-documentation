# AI-Driven Development

Skapi works seamlessly with AI-powered coding assistants.

To help your assistant understand how to integrate the Skapi API into your project, download and use the system prompt file described below.

## For Chat-Based Platforms (e.g., ChatGPT, Lovable)

### 1. Download the system prompt file

<a href="https://docs.skapi.com/SKAPI.md" download="SKAPI.md">⬇️ SKAPI.md (Click to Download)</a>

### 2. Attach the file and send a prompt to your AI

Paste something like the following when you start your chat:

```
Use the file "SKAPI.md" as a system prompt.
My Skapi service ID is: "xxxxxxxxxxxx-xxxxx-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".
Build me a [describe what you want].
```

Replace the placeholder service ID with your actual service ID, and customize the last line with what you want to build.

## For AI Code Generators (e.g., Claude Code, OpenAI Codex, Gemini CLI)

### 1. Download the system prompt file

<a href="https://docs.skapi.com/SKAPI.md" download="SKAPI.md">⬇️ SKAPI.md (Click to Download)</a>

### 2. Rename and add it to your project

Rename the downloaded SKAPI.md file to a filename your tool recognizes, then add it to your project folder.

Examples:

- AGENT.md for OpenAI Codex
- CLAUDE.md for Anthropic Claude
- GEMINI.md for Gemini CLI

### 3. Start writing prompts

When you invoke your code generator, include a prompt like:

```
My Skapi service ID is: "xxxxxxxxxxxx-xxxxx-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".
Build me a [describe what you want].
```

Replace the placeholder service ID with your actual service ID before you run the command.