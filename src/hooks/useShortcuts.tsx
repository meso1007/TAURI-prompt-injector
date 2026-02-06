import { useEffect } from "react";
import { register, isRegistered } from '@tauri-apps/plugin-global-shortcut';
import { Prompt } from "../types";
import { executePrompt } from "../utils/action";

export const useShortcuts = (prompts: Prompt[]) => {
  useEffect(() => {
    // 安全装置: Tauri環境でない場合（普通のブラウザなど）は何もしない
    // @ts-ignore
    if (!window.__TAURI_INTERNALS__) {
      return;
    }

    const setupShortcuts = async () => {
      try {
        // ★重要: Rust側で登録した "Alt+Space" を消さないように、
        // JS側では unregisterAll() を呼ばない、もしくは個別に管理するのが安全です。
        // ここでは念のため、JSで登録しようとしているキーだけを登録します。

        for (const prompt of prompts) {
          // 空のショートカットは無視
          if (!prompt.shortcut || prompt.shortcut.trim() === "") continue;

          // 既に登録済みかチェック (Rust側で登録されているキーとの衝突回避)
          const registered = await isRegistered(prompt.shortcut).catch(() => false);
          if (registered) {
            console.log(`⚠️ Skipped duplicate/registered key: ${prompt.shortcut}`);
            continue;
          }

          // 登録実行
          await register(prompt.shortcut, async (event) => {
            if (event.state === "Pressed") {
              console.log(`🚀 Triggered by JS: ${prompt.title}`);
              await executePrompt(prompt);
            }
          }).catch(err => {
            console.warn(`⚠️ Failed to register ${prompt.shortcut}:`, err);
          });
          
          console.log(`✅ Registered JS Shortcut: ${prompt.shortcut}`);
        }

      } catch (err) {
        console.error("🔥 Shortcut setup error (ignored):", err);
      }
    };

    setupShortcuts();

    // クリーンアップ: 本来はここで解除すべきですが、
    // Rust側のショートカットを巻き添えにしないよう、今回は何もしないか、
    // 厳密にやるなら「自分が登録したキーだけ」を unregister します。
    return () => {
      // unregisterAll(); // ← これをコメントアウトしてRust側の Alt+Space を守る
    };
  }, [prompts]);
};