import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { sendNotification } from '@tauri-apps/plugin-notification';
import { Prompt } from "../types";

export const executePrompt = async (prompt: Prompt) => {
  try {
    // 1. クリップボード読み込み (ここを安全にする)
    let userClipboard = "";
    try {
      userClipboard = await readText();
    } catch (e) {
      console.warn("Clipboard is empty or non-text:", e);
      // エラーでも続行し、空文字として扱う
      userClipboard = "";
    }
    
    // 2. プロンプト生成
    // もし {{selection}} があるのにクリップボードが空なら、警告を出すのも手ですが、
    // ここでは空文字で置換して続行します。
    const finalContent = prompt.content.replace("{{selection}}", userClipboard || "");
    
    // 3. 書き込み
    await writeText(finalContent);
    
    // 4. ウィンドウを隠す
    try {
      await getCurrentWebviewWindow().hide();
    } catch (e) { /* ignore */ }

    // 5. 通知
    sendNotification({
      title: "Tsuchi",
      body: `✅ Copied: ${prompt.title}`,
    });
    
    console.log("Copied with injection:", prompt.title);

  } catch (err) {
    console.error("Failed to process prompt:", err);
    
    sendNotification({
      title: "Tsuchi Error",
      body: "Failed to process text.",
    });
  }
};