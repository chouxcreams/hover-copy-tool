import type React from "react";
import { useEffect, useState } from "react";
import { loadAppEnabled, saveAppEnabled } from "../utils/storage";
import ToggleSwitch from "./ToggleSwitch";

interface RegexPattern {
  id: string;
  name: string;
  regex: string;
  createdAt: number;
}

interface StorageData {
  regexPatterns?: RegexPattern[];
  activePatternIds?: string[];
}

const PopupApp: React.FC = () => {
  const [patterns, setPatterns] = useState<RegexPattern[]>([]);
  const [activePatternIds, setActivePatternIds] = useState<string[]>([]);
  const [editingPatternId, setEditingPatternId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", regex: "" });
  const [isAppEnabled, setIsAppEnabled] = useState(true);

  useEffect(() => {
    loadPatterns();
    loadAppEnabledState();
  }, []);

  const loadPatterns = async (): Promise<void> => {
    try {
      const result = (await chrome.storage.sync.get([
        "regexPatterns",
        "activePatternIds",
        "activePatternId", // Legacy support
      ])) as StorageData & { activePatternId?: string };
      const loadedPatterns = result.regexPatterns || [];

      let activeIds = result.activePatternIds || [];
      // Migration: convert old single activePatternId to array
      if (!result.activePatternIds && result.activePatternId) {
        activeIds = [result.activePatternId];
      }

      setPatterns(loadedPatterns);
      setActivePatternIds(activeIds);
    } catch (error) {
      console.error("Failed to load patterns:", error);
      setPatterns([]);
      setActivePatternIds([]);
    }
  };

  const loadAppEnabledState = async (): Promise<void> => {
    try {
      const enabled = await loadAppEnabled();
      setIsAppEnabled(enabled);
    } catch (error) {
      console.error("Failed to load app enabled state:", error);
      setIsAppEnabled(true);
    }
  };

  const savePatterns = async (
    newPatterns: RegexPattern[],
    newActiveIds: string[]
  ): Promise<void> => {
    try {
      await chrome.storage.sync.set({
        regexPatterns: newPatterns,
        activePatternIds: newActiveIds,
      });
      setPatterns(newPatterns);
      setActivePatternIds(newActiveIds);
    } catch (error) {
      console.error("Failed to save patterns:", error);
    }
  };

  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const toggleForm = (): void => {
    setShowForm(!showForm);
    if (!showForm) {
      setFormData({ name: "", regex: "" });
      setEditingPatternId(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const { name, regex } = formData;
    if (!name.trim() || !regex.trim()) {
      alert("パターン名と正規表現を入力してください。");
      return;
    }

    try {
      new RegExp(regex);
    } catch (error) {
      alert("正規表現が無効です。正しい形式で入力してください。");
      return;
    }

    const pattern: RegexPattern = {
      id: editingPatternId || generateId(),
      name: name.trim(),
      regex: regex.trim(),
      createdAt: editingPatternId
        ? patterns.find((p) => p.id === editingPatternId)?.createdAt ||
          Date.now()
        : Date.now(),
    };

    let newPatterns: RegexPattern[];
    let newActiveIds = [...activePatternIds];

    if (editingPatternId) {
      const index = patterns.findIndex((p) => p.id === editingPatternId);
      newPatterns = [...patterns];
      if (index >= 0) {
        newPatterns[index] = pattern;
      }
    } else {
      newPatterns = [...patterns, pattern];
      if (newPatterns.length === 1) {
        newActiveIds = [pattern.id];
      }
    }

    await savePatterns(newPatterns, newActiveIds);
    toggleForm();
  };

  const togglePatternActive = async (patternId: string): Promise<void> => {
    const isActive = activePatternIds.includes(patternId);
    let newActiveIds: string[];

    if (isActive) {
      newActiveIds = activePatternIds.filter((id) => id !== patternId);
    } else {
      newActiveIds = [...activePatternIds, patternId];
    }

    await savePatterns(patterns, newActiveIds);
  };

  const editPattern = (patternId: string): void => {
    const pattern = patterns.find((p) => p.id === patternId);
    if (!pattern) return;

    setFormData({ name: pattern.name, regex: pattern.regex });
    setEditingPatternId(patternId);
    setShowForm(true);
  };

  const deletePattern = async (patternId: string): Promise<void> => {
    if (!confirm("このパターンを削除しますか？")) return;

    const newPatterns = patterns.filter((p) => p.id !== patternId);
    const newActiveIds = activePatternIds.filter((id) => id !== patternId);

    await savePatterns(newPatterns, newActiveIds);
  };

  const toggleAppEnabled = async (newState: boolean): Promise<void> => {
    try {
      await saveAppEnabled(newState);
      setIsAppEnabled(newState);
    } catch (error) {
      console.error("Failed to toggle app enabled state:", error);
    }
  };

  const exportSettings = (): void => {
    const exportData = {
      regexPatterns: patterns,
      activePatternIds: activePatternIds,
      isAppEnabled: isAppEnabled,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `hover-copy-tool-settings-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);

        if (
          !importData.regexPatterns ||
          !Array.isArray(importData.regexPatterns)
        ) {
          alert(
            "無効なファイル形式です。正しい設定ファイルを選択してください。"
          );
          return;
        }

        const validPatterns = importData.regexPatterns.filter(
          (pattern: RegexPattern) =>
            pattern.id &&
            pattern.name &&
            pattern.regex &&
            typeof pattern.createdAt === "number"
        );

        if (validPatterns.length === 0) {
          alert("有効なパターンが見つかりませんでした。");
          return;
        }

        for (const pattern of validPatterns) {
          try {
            new RegExp(pattern.regex);
          } catch (regexError) {
            alert(
              `無効な正規表現が含まれています: ${pattern.name} - ${pattern.regex}`
            );
            return;
          }
        }

        const importActiveIds = Array.isArray(importData.activePatternIds)
          ? importData.activePatternIds.filter((id: string) =>
              validPatterns.some((p: RegexPattern) => p.id === id)
            )
          : [];

        if (
          confirm(
            `${validPatterns.length}個のパターンをインポートします。既存の設定は置き換えられます。続行しますか？`
          )
        ) {
          await savePatterns(validPatterns, importActiveIds);
          
          // Import app enabled state if available
          if (typeof importData.isAppEnabled === "boolean") {
            await saveAppEnabled(importData.isAppEnabled);
            setIsAppEnabled(importData.isAppEnabled);
          }
          
          alert("設定のインポートが完了しました。");
        }
      } catch (error) {
        console.error("Import error:", error);
        alert(
          "ファイルの読み込みに失敗しました。正しいJSONファイルを選択してください。"
        );
      }
    };
    reader.readAsText(file);

    event.target.value = "";
  };

  return (
    <div className="popup-container">
      <div className="header">
        <h1>Hover Copy Tool</h1>
        <p>正規表現パターンの設定</p>
        <ToggleSwitch
          checked={isAppEnabled}
          onChange={toggleAppEnabled}
          className="toggle-switch-header"
        />
      </div>

      <div className="section">
        <div className="section-title">保存されたパターン</div>
        <div className="pattern-list">
          {patterns.length === 0 ? (
            <div className="no-patterns">パターンが登録されていません</div>
          ) : (
            patterns.map((pattern) => {
              const isActive = activePatternIds.includes(pattern.id);
              return (
                <div
                  key={pattern.id}
                  className={`pattern-item ${isActive ? "active" : ""}`}
                >
                  <div className="pattern-header">
                    <div className="pattern-name">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => togglePatternActive(pattern.id)}
                        style={{ marginRight: "8px" }}
                      />
                      {pattern.name}
                    </div>
                    <div className="pattern-actions">
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => editPattern(pattern.id)}
                      >
                        編集
                      </button>
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => deletePattern(pattern.id)}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                  <div className="pattern-regex">{pattern.regex}</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="toggle-form">
        <button type="button" onClick={toggleForm}>
          {showForm ? "フォームを閉じる" : "新しいパターンを追加"}
        </button>
      </div>

      <div className="section">
        <div className="section-title">設定の管理</div>
        <div className="settings-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={exportSettings}
          >
            設定をエクスポート
          </button>
          <label className="btn btn-secondary" style={{ marginLeft: "8px" }}>
            設定をインポート
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>

      {showForm && (
        <form className="pattern-form" onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label htmlFor="patternName">パターン名:</label>
            <input
              type="text"
              id="patternName"
              placeholder="例: ユーザーID抽出"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="patternRegex">正規表現:</label>
            <input
              type="text"
              id="patternRegex"
              placeholder="例: /user/(\d+)"
              value={formData.regex}
              onChange={(e) =>
                setFormData({ ...formData, regex: e.target.value })
              }
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={toggleForm}
            >
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary">
              保存
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PopupApp;
