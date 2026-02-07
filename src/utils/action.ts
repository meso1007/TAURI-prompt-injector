import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { sendNotification } from '@tauri-apps/plugin-notification';
import { Prompt } from "../types";

export const executePrompt = async (prompt: Prompt) => {
  try {
    // 1. クリップボード読み込み (エラー時は空文字にする)
    let userClipboard = "";
    try {
      userClipboard = await readText();
    } catch (e) {
      console.warn("Clipboard is empty or non-text:", e);
      userClipboard = "";
    }
    
    // 2. プロンプト生成ロジック
    let finalContent = prompt.content;
    
    // 正規表現: {{selection}} を探す (g=全て, i=大文字小文字無視)
    const selectionRegex = /\{\{selection\}\}/gi;

    if (selectionRegex.test(finalContent)) {
      // A. タグがある場合 -> そこを置換する
      finalContent = finalContent.replace(selectionRegex, userClipboard || "");
    } else {
      // B. タグがない場合 -> 末尾に自動追加する (クリップボードがある場合のみ)
      if (userClipboard) {
        finalContent = `${finalContent}\n\n${userClipboard}`;
      }
    }
    
    // 3. 書き込み
    await writeText(finalContent);
    
    // 4. ウィンドウを隠す (非同期で待たなくて良い処理はawaitしなくてもOKだが、確実性のためawait)
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