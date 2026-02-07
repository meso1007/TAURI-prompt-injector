# Tsuchi 🐍✨

**Tsuchi** is a resident desktop assistant designed to optimize AI interactions based on the latest research in prompt engineering.

Living quietly in your macOS menu bar (or Windows/Linux system tray), Tsuchi provides instant access to scientifically verified prompt templates that maximize the reasoning capabilities and accuracy of Large Language Models (LLMs).

## 📖 Overview

Prompting is not just about writing text; it is about engineering the model's latent space. Tsuchi integrates proven inference frameworks—such as **Chain-of-Thought** and **ReAct**—as default presets.

Users can inject these "reasoning patterns" into their workflow with a single click, significantly reducing hallucinations and improving logical consistency.

## 🔬 Scientifically Verified Prompt Library

Tsuchi's default prompts are curated based on seminal papers in the field of Natural Language Processing.

| Method | Description | Reference Paper |
| :--- | :--- | :--- |
| **CoT (Chain of Thought)** | Enhances complex reasoning by forcing the model to generate intermediate steps ("Let's think step by step") before the final answer. | [Wei et al. (2022) "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models"](https://arxiv.org/abs/2201.11903) |
| **Zero-shot CoT** | A technique to trigger reasoning capabilities without few-shot examples, simply by appending specific magic words. | [Kojima et al. (2022) "Large Language Models are Zero-Shot Reasoners"](https://arxiv.org/abs/2205.11916) |
| **ReAct (Reason + Act)** | Synergizes reasoning and acting traces, allowing the model to interact with external tools or structure its thoughts more logically. | [Yao et al. (2022) "ReAct: Synergizing Reasoning and Acting in Language Models"](https://arxiv.org/abs/2210.03629) |
| **Self-Consistency** | Generates multiple reasoning paths and selects the most consistent answer, effectively "voting" for the best outcome to reduce errors. | [Wang et al. (2022) "Self-Consistency Improves Chain of Thought Reasoning in Language Models"](https://arxiv.org/abs/2203.11171) |
| **Tree of Thoughts** | *(Coming Soon)* Enables the model to explore multiple branches of reasoning, evaluating states to solve strategic problems. | [Yao et al. (2023) "Tree of Thoughts: Deliberate Problem Solving with Large Language Models"](https://arxiv.org/abs/2305.10601) |

## ⚡️ Key Features

* **⚡️ Quick Injection:**
    Access your prompt library instantly from the system tray. Select a method (e.g., *CoT*) and Tsuchi will format your current clipboard content or input into the optimal structure.

* **🧠 Context-Aware Templates:**
    Automatically detects the context of your clipboard (Code, Text, Data) and suggests the most appropriate prompt strategy (e.g., "Refactor Code" vs "Summarize Text").

* **🎨 Native OS Integration:**
    * **macOS:** Features a smart menu bar icon that uses `Template` images to automatically adapt to Light Mode and Dark Mode.
    * **Windows/Linux:** Fully supported with high-contrast system tray icons.

* **🚀 Lightweight Performance:**
    Built with Rust and Tauri v2, Tsuchi consumes minimal system resources (~10MB RAM) while running in the background.

## ⌨️ Usage & Keyboard Shortcuts

Tsuchi is designed for a keyboard-centric workflow to keep you in flow.

- **Global Shortcuts**:
  - `Cmd+Shift+Space` (Default): Open Tsuchi

- **In-App Navigation**:
  - `Cmd+N`: Create new prompt
  - `Cmd+E`: Edit selected prompt
  - `Cmd+I`: View prompt details
  - `Cmd+Backspace`: Delete prompt
  - `Cmd+,`: Open Settings
  - `Enter`: Execute selected prompt (copies to clipboard and hides window)
  - `Esc`: Close window or clear search
  - `Arrow Keys`: Navigate list

- **Smart Injection**: 
  - Automatically replaces `{{selection}}` in your prompt with your current clipboard content. 
  - If no placeholder is found, it appends the clipboard content to the end.

## 🛠️ Tech Stack

* **Core Framework:** [Tauri v2](https://v2.tauri.app/)
* **Backend:** Rust
* **Frontend:** React / TypeScript / TailwindCSS
* **Build Tool:** Vite

## 📦 Installation & Development

### Prerequisites
* Rust / Cargo
* Node.js & pnpm

### Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/tsuchi.git
    cd tsuchi
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Run in development mode:**
    ```bash
    pnpm tauri dev
    ```

4.  **Build for Production**:
    ```bash
    pnpm tauri build
    ```

## 🏗 Developer Notes

- **Prompts**: Stored in local state (managed by `usePrompts` hook).
- **Execution Logic**: Located in `src/utils/action.ts`. It handles clipboard reading, text replacement, and writing back to the clipboard.
- **Shortcuts**: Configured in `src/hooks/useShortcuts.ts` and `App.tsx`.
- **Project Structure**:
    - **Frontend**: `src/` (React + TypeScript + Vite + Tailwind CSS)
    - **Backend / Core**: `src-tauri/` (Rust) for system integration
    - **State Management**: React Context & Hooks

## 📝 License

[MIT](LICENSE)