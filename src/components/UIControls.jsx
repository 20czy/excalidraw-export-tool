// Main UI Controls Component
export function UIControls({ 
  excalidrawAPI, 
  isExporting, 
  handleExportImages,
  handleExportSelected,
  selectExportFolder,
  exportFolder,
  isTauri
}) {
  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
      {/* Debug info - can be removed */}
      <div style={{ 
        fontSize: "12px", 
        color: "#666",
        padding: "4px 8px",
        background: "#f0f0f0",
        borderRadius: "4px"
      }}>
        {isTauri ? "✅ Tauri 模式" : "🌐 浏览器模式"}
      </div>

      {/* Always show folder selection button */}
      <button
        onClick={selectExportFolder}
        disabled={isExporting}
        style={{
          padding: "6px 12px",
          background: isExporting ? "#ccc" : (exportFolder ? "#28a745" : "#6c757d"),
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: isExporting ? "not-allowed" : "pointer",
          fontWeight: "bold",
          fontSize: "14px",
        }}
        title={exportFolder || "点击选择导出文件夹"}
      >
        📁 {exportFolder ? "✓ 已选择文件夹" : "选择导出文件夹"}
      </button>

      <button
        onClick={handleExportImages}
        disabled={!excalidrawAPI || isExporting}
        style={{
          padding: "6px 12px",
          background: excalidrawAPI && !isExporting ? "#007bff" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor:
            excalidrawAPI && !isExporting ? "pointer" : "not-allowed",
          fontWeight: "bold",
          fontSize: "14px",
        }}
      >
        {isExporting ? "导出中..." : "导出所有图片 (1440x1440)"}
      </button>

      <button
        onClick={handleExportSelected}
        disabled={!excalidrawAPI || isExporting}
        style={{
          padding: "6px 12px",
          background: excalidrawAPI && !isExporting ? "#28a745" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor:
            excalidrawAPI && !isExporting ? "pointer" : "not-allowed",
          fontWeight: "bold",
          fontSize: "14px",
        }}
      >
        {isExporting ? "导出中..." : "导出选中元素"}
      </button>
    </div>
  );
}

// File Input Component
export function FileInput({ handleFile }) {
  return (
    <input
      id="file-picker"
      type="file"
      accept=".excalidraw"
      style={{ display: "none" }}
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        e.target.value = "";
      }}
    />
  );
}
