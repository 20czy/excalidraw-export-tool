/**
 * Tauri v2 标准环境检测
 * 以插件可用性为准（最可靠）
 */
export async function detectTauri(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    const tauri = (window as Window & { __TAURI__?: { core?: { invoke?: unknown } } }).__TAURI__;
    return Boolean(tauri?.core?.invoke);
}
  
