import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { sendNotification } from '@tauri-apps/plugin-notification'; // ★ インポート
import { Prompt } from "../types";

export const executePrompt = async (prompt: Prompt) => {
  try {
    // 1. クリップボード読み込み
    const userClipboard = await readText();
    
    // 2. プロンプト生成 & 書き込み
    const finalContent = prompt.content.replace("{{selection}}", userClipboard || "");
    await writeText(finalContent);
    
    // 3. ウィンドウを隠す
    try {
      await getCurrentWebviewWindow().hide();
    } catch (e) { /* ignore */ }

    // 4. ★ 通知を出す (ここが新機能)
    sendNotification({
      title: "Tsuchi",
      body: `✅ Copied: ${prompt.title}`,
    });
    
    console.log("Copied with injection:", prompt.title);

  } catch (err) {
    console.error("Failed to copy:", err);
    
    // エラー時も通知
    sendNotification({
      title: "Tsuchi Error",
      body: "Failed to process text.",
    });
  }
};