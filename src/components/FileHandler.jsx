import { useCallback } from 'react';

// File parsing utility
export async function parseExcalidrawFile(file) {
  const text = await file.text();
  const data = JSON.parse(text);

  if (data.type !== "excalidraw") {
    throw new Error("Invalid excalidraw file");
  }

  return data;
}

// Custom hook for file handling
export function useFileHandler(excalidrawAPI) {
  const handleFile = useCallback(async (file) => {
    if (!excalidrawAPI) {
      console.error("Excalidraw API not ready yet");
      return;
    }

    try {
      const sceneData = await parseExcalidrawFile(file);
      console.log("Loading scene data:", sceneData);

      if (sceneData.files && Object.keys(sceneData.files).length > 0) {
        const fileDataArray = Object.entries(sceneData.files).map(
          ([id, fileData]) => ({
            id,
            mimeType: fileData.mimeType,
            dataURL: fileData.dataURL,
            created: fileData.created || Date.now(),
            lastRetrieved: fileData.lastRetrieved || Date.now(),
          })
        );

        excalidrawAPI.addFiles(fileDataArray);
        console.log("Added files to Excalidraw:", fileDataArray.length);
      }

      excalidrawAPI.updateScene({
        elements: sceneData.elements || [],
        appState: sceneData.appState || {},
      });
    } catch (error) {
      console.error("Failed to load file:", error);
    }
  }, [excalidrawAPI]);

  return { handleFile };
}
