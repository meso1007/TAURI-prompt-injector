import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { register, unregisterAll } from '@tauri-apps/plugin-global-shortcut';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

type ThemeMode = "dark" | "light";

type AppSettings = {
  themeColor: string;
  themeMode: ThemeMode;
  language: "en" | "ja";
  launcherShortcut: string;
};

const DEFAULT_SETTINGS: AppSettings = {
  themeColor: "#EC4899",
  themeMode: "light",
  language: "en",
  launcherShortcut: "Alt+Space",
};

// ▼▼▼ export を追加 ▼▼▼
export const THEMES = {
  dark: {
    "--bg-main": "#191919",
    "--bg-sub": "#262626",     // 少し明るくして入力欄を見やすく
    "--bg-hover": "#2a2a2a",
    "--border": "#333333",
    "--text-main": "#ffffff",
    "--text-sub": "#a3a3a3",   // neutral-400
    "--shadow": "rgba(0,0,0,0.5)",
  },
  light: {
    "--bg-main": "#ffffff",
    "--bg-sub": "#f3f4f6",     // gray-100 (入力欄用)
    "--bg-hover": "#e5e7eb",
    "--border": "#e5e7eb",
    "--text-main": "#1f2937",
    "--text-sub": "#6b7280",
    "--shadow": "rgba(0,0,0,0.1)",
  }
};

type SettingsContextType = {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("tsuchi-settings");
    const parsed = saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...parsed };
  });

  const isUpdatingRef = useRef(false);

  useEffect(() => {
    localStorage.setItem("tsuchi-settings", JSON.stringify(settings));
    
    document.documentElement.style.setProperty("--accent-color", settings.themeColor);

    const theme = THEMES[settings.themeMode];
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

  }, [settings]);

  useEffect(() => {
    const registerShortcut = async () => {
      const shortcut = settings.launcherShortcut;
      if (isUpdatingRef.current || !shortcut) return;
      isUpdatingRef.current = true;

      try {
        await unregisterAll();
        await register(shortcut, async (event) => {
          if (event.state === "Pressed") {
            const win = getCurrentWebviewWindow();
            if (await win.isVisible()) {
              await win.hide();
            } else {
              await win.show();
              await win.setFocus();
            }
          }
        });
      } catch (err) {
        console.error("❌ Failed to register shortcut:", err);
      } finally {
        isUpdatingRef.current = false;
      }
    };
    registerShortcut();
    return () => {};
  }, [settings.launcherShortcut]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};