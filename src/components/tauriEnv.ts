/**
 * Tauri v2 标准环境检测
 * 以插件可用性为准（最可靠）
 */
export async function detectTauri(): Promise<boolean> {
    try {
      // 任意一个 v2 插件都可以作为探测点
      await import("@tauri-apps/plugin-dialog");
      return true;
    } catch {
      return false;
    }
  }
  