import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import { useEffect, useState } from "react";
import { useTauriFileOperations } from "./components/useTauriFileoperations";
import { useExportOperations } from "./components/ExportOperations";
import { useFileHandler } from "./components/FileHandler";
import { UIControls, FileInput } from "./components/UIControls";
import { detectTauri } from "./components/tauriEnv";

/**
 * 主应用组件
 * 整合 Excalidraw 绘图库与 Tauri 桌面应用能力，提供文件操作、导出等功能
 */
function App() {
  // 存储 Excalidraw 实例 API，用于调用绘图库的各种方法
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);

  // ==================== Tauri 相关 Hooks ====================
  // 检测是否运行在 Tauri 环境中
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    let isMounted = true;
    detectTauri().then((result) => {
      if (isMounted) setIsTauri(result);
    });
    return () => { 
      isMounted = false;
    };
  }, []);
  
  // Tauri 文件操作：导出文件夹选择、文件保存等
  const { 
    exportFolder, 
    selectExportFolder, 
    saveFile: saveFileToTauri 
  } = useTauriFileOperations();

  // ==================== 导出功能 Hooks ====================
  // 图片导出、选中元素导出等操作
  const { 
    isExporting, 
    handleExportImages, 
    handleExportSelected 
  } = useExportOperations(
    excalidrawAPI,
    exportFolder,
    saveFileToTauri,
    selectExportFolder
  );

  const { handleFile } = useFileHandler(excalidrawAPI);

  // ==================== 渲染 UI ====================
  return (
    <div style={{ 
      position: "fixed", 
      inset: 0, // 让容器占满整个视口
    }}>
      {/* Excalidraw 核心绘图组件 */}
      <Excalidraw 
        langCode="zh-CN" // 设置中文语言
        // 获取 Excalidraw 实例 API
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        // 自定义右上角 UI 控件
        renderTopRightUI={() => (
          <UIControls 
            excalidrawAPI={excalidrawAPI}
            isExporting={isExporting}
            handleExportImages={handleExportImages}
            handleExportSelected={handleExportSelected}
            selectExportFolder={selectExportFolder}
            exportFolder={exportFolder}
            isTauri={isTauri}
          />
        )}
      >
        {/* 自定义主菜单 */}
        <MainMenu>
          {/* 默认菜单项：加载场景 */}
          <MainMenu.DefaultItems.LoadScene />
          {/* 默认菜单项：保存到当前文件 */}
          <MainMenu.DefaultItems.SaveToActiveFile />
          {/* 默认菜单项：导出 */}
          <MainMenu.DefaultItems.Export />
          {/* 默认菜单项：另存为图片 */}
          <MainMenu.DefaultItems.SaveAsImage />
          
          <MainMenu.Separator />
          
          {/* 自定义菜单项：加载画板文件 */}
          <MainMenu.Item 
            onSelect={() => document.getElementById("file-picker")?.click()}
          >
            加载画板文件
          </MainMenu.Item>
          
          <MainMenu.Separator />
          
          {/* 自定义菜单项：选择导出文件夹 */}
          <MainMenu.Item onSelect={selectExportFolder}>
            📁 选择导出文件夹 {exportFolder && "✓"}
          </MainMenu.Item>
          
          <MainMenu.Separator />
          
          {/* 默认菜单项：帮助 */}
          <MainMenu.DefaultItems.Help />
          {/* 默认菜单项：清空画布 */}
          <MainMenu.DefaultItems.ClearCanvas />
          {/* 默认菜单项：切换主题 */}
          <MainMenu.DefaultItems.ToggleTheme />
          {/* 默认菜单项：更改画布背景 */}
          <MainMenu.DefaultItems.ChangeCanvasBackground />
        </MainMenu>
      </Excalidraw>

      {/* 文件选择输入框（隐藏），用于加载本地画板文件 */}
      <FileInput handleFile={handleFile} />
    </div>
  );
}

export default App;
