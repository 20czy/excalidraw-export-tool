import { useState, useCallback } from 'react';
import { exportToBlob } from "@excalidraw/excalidraw";
import { detectTauri } from "./tauriEnv";

// Custom hook for export functionality
export function useExportOperations(excalidrawAPI, exportFolder, saveFileToTauri, selectExportFolder) {
  const [isExporting, setIsExporting] = useState(false);

  // Save file to browser
  const saveFileToBrowser = useCallback((blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  // Export all images
  const handleExportImages = useCallback(async () => {
    if (!excalidrawAPI) return;
    setIsExporting(true);

    try {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const files = excalidrawAPI.getFiles();

      const imageElements = elements.filter((el) => el.type === "image");

      if (imageElements.length === 0) {
        alert("未找到可导出的图片元素");
        setIsExporting(false);
        return;
      }

      console.log(`找到 ${imageElements.length} 个图片元素待导出`);

      const isTauriAvailable = await detectTauri();

      let targetFolder = exportFolder;

      if (isTauriAvailable && !targetFolder && selectExportFolder) {
        const confirmSelect = confirm(
          `即将导出 ${imageElements.length} 张图片。\n\n是否选择导出文件夹？\n点击"确定"选择文件夹，点击"取消"将逐个选择保存位置。`
        );

        if (confirmSelect) {
          try {
            targetFolder = await selectExportFolder();
          } catch (error) {
            console.error("Error selecting export folder:", error);
          }
        }
      }

      const TARGET_SIZE = 1440;
      let successCount = 0;

      for (let i = 0; i < imageElements.length; i++) {
        const imageElement = imageElements[i];

        // Calculate image bounds
        const imageBounds = {
          minX: imageElement.x,
          minY: imageElement.y,
          maxX: imageElement.x + imageElement.width,
          maxY: imageElement.y + imageElement.height,
        };

        // Find overlapping or nearby elements (tags)
        const relatedElements = elements.filter((el) => {
          if (el.id === imageElement.id) return true;

          const elBounds = {
            minX: el.x,
            minY: el.y,
            maxX: el.x + (el.width || 0),
            maxY: el.y + (el.height || 0),
          };

          const margin = 5;
          return !(
            elBounds.maxX < imageBounds.minX - margin ||
            elBounds.minX > imageBounds.maxX + margin ||
            elBounds.maxY < imageBounds.minY - margin ||
            elBounds.minY > imageBounds.maxY + margin
          );
        });

        // Calculate actual content dimensions
        const contentWidth = imageBounds.maxX - imageBounds.minX;
        const contentHeight = imageBounds.maxY - imageBounds.minY;

        // Calculate scale
        const scale = Math.max(
          TARGET_SIZE / contentWidth,
          TARGET_SIZE / contentHeight
        );

        const blob = await exportToBlob({
          elements: relatedElements,
          appState: {
            ...appState,
            exportBackground: true,
            exportWithDarkMode: false,
          },
          files: files,
          mimeType: "image/png",
          exportPadding: 0,
          exportEmbedScene: false,
          getDimensions: () => ({
            width: TARGET_SIZE,
            height: TARGET_SIZE,
            scale: scale,
          }),
        });

        const filename = `image_${i + 1}_${imageElement.id.slice(0, 8)}.png`;

        // Choose save method based on environment
        if (isTauriAvailable) {
          const saved = await saveFileToTauri(blob, filename, targetFolder);
          if (saved) successCount++;
        } else {
          saveFileToBrowser(blob, filename);
          successCount++;
        }

        // Add small delay
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      alert(
        `成功导出 ${successCount}/${imageElements.length} 张图片 (${TARGET_SIZE}x${TARGET_SIZE}px)${
          isTauriAvailable && targetFolder ? `\n保存位置: ${targetFolder}` : ""
        }`
      );
    } catch (error) {
      console.error("Error exporting images:", error);
      alert("导出图片时出错，请查看控制台日志。");
    } finally {
      setIsExporting(false);
    }
  }, [excalidrawAPI, exportFolder, saveFileToTauri, saveFileToBrowser, selectExportFolder]);

  // Export selected elements
  const handleExportSelected = useCallback(async () => {
    if (!excalidrawAPI) return;
    setIsExporting(true);

    try {
      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const files = excalidrawAPI.getFiles();

      // Get selected elements
      const selectedElements = elements.filter(
        (el) => appState.selectedElementIds?.[el.id]
      );

      if (selectedElements.length === 0) {
        alert("请先选中要导出的元素");
        setIsExporting(false);
        return;
      }

      // Calculate bounds of selected elements
      let minX = Infinity,
        minY = Infinity;
      let maxX = -Infinity,
        maxY = -Infinity;

      selectedElements.forEach((el) => {
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + (el.width || 0));
        maxY = Math.max(maxY, el.y + (el.height || 0));
      });

      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;
      const scale = 4;

      const blob = await exportToBlob({
        elements: selectedElements,
        appState: {
          ...appState,
          exportBackground: true,
          exportWithDarkMode: false,
        },
        files: files,
        mimeType: "image/png",
        exportPadding: 0,
        exportEmbedScene: false,
        getDimensions: () => ({
          width: contentWidth * scale,
          height: contentHeight * scale,
          scale: scale,
        }),
      });

      const filename = `selected_elements_${Date.now()}.png`;

      // Check Tauri availability dynamically
      const isTauriAvailable = await detectTauri();
      
      // Choose save method based on environment
      if (isTauriAvailable) {
        await saveFileToTauri(blob, filename, exportFolder);
        alert(`导出成功${exportFolder ? `\n保存位置: ${exportFolder}` : ""}`);
      } else {
        saveFileToBrowser(blob, filename);
        alert("导出成功");
      }
    } catch (error) {
      console.error("Error exporting selected elements:", error);
      alert("导出选中元素时出错，请查看控制台日志。");
    } finally {
      setIsExporting(false);
    }
  }, [excalidrawAPI, exportFolder, saveFileToTauri, saveFileToBrowser]);

  return {
    isExporting,
    handleExportImages,
    handleExportSelected
  };
}
