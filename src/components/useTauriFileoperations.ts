import { useCallback, useState } from "react";
import { detectTauri } from "./tauriEnv";

export function useTauriFileOperations() {
  const [exportFolder, setExportFolder] = useState<string | null>(null);

  /**
   * 选择导出文件夹
   */
  const selectExportFolder = useCallback(async () => {
    if (!(await detectTauri())) {
      return null;
    }

    const { open } = await import("@tauri-apps/plugin-dialog");

    const selected = await open({
      directory: true,
      multiple: false,
      title: "选择导出文件夹",
    });

    if (typeof selected === "string") {
      setExportFolder(selected);
      return selected;
    }

    return null;
  }, []);

  /**
   * 保存文件到本地（支持自动路径 / 弹窗）
   */
  const saveFile = useCallback(
    async (
      blob: Blob,
      filename: string,
      folder?: string | null
    ): Promise<boolean> => {
      if (!(await detectTauri())) {
        return false;
      }

      const { writeFile } = await import("@tauri-apps/plugin-fs");
      const { save } = await import("@tauri-apps/plugin-dialog");

      let filePath: string | null;

      if (folder) {
        const { join } = await import("@tauri-apps/api/path");
        filePath = await join(folder, filename);
      } else {
        filePath = await save({
          defaultPath: filename,
        });
      }

      if (!filePath) return false;

      const buffer = await blob.arrayBuffer();
      await writeFile(filePath, new Uint8Array(buffer));

      return true;
    },
    []
  );

  return {
    exportFolder,
    setExportFolder,
    selectExportFolder,
    saveFile,
  };
}
