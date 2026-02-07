use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
    Emitter,
    Manager,
    image::Image, 
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            let show_i = MenuItem::with_id(app, "show", "Show Tsuchi", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            #[cfg(target_os = "macos")]
            let icon_bytes = include_bytes!("../../iconTemplate.png");

            #[cfg(not(target_os = "macos"))]
            let icon_bytes = include_bytes!("../../icon.png");

            // ▼▼▼ 修正箇所: ここを変数 tray で受けるように変更 ▼▼▼
            let tray = TrayIconBuilder::new()
                .icon(Image::from_bytes(icon_bytes).expect("tray icon not found"))
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                            let _ = window.set_always_on_top(true);
                            let _ = window.emit("tray-opened", ());
                        }
                    }
                })
                .build(app)?; // ここで一旦ビルド完了

            // ★★★ ここが最重要！Macの場合だけ「テンプレートモード」をONにする ★★★
            #[cfg(target_os = "macos")]
            let _ = tray.set_icon_as_template(true);

            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}