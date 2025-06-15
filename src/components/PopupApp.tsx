import React, { useState, useEffect } from 'react';

interface RegexPattern {
  id: string;
  name: string;
  regex: string;
  createdAt: number;
}

interface StorageData {
  regexPatterns?: RegexPattern[];
  activePatternId?: string;
}

const PopupApp: React.FC = () => {
  const [patterns, setPatterns] = useState<RegexPattern[]>([]);
  const [activePatternId, setActivePatternId] = useState<string | null>(null);
  const [editingPatternId, setEditingPatternId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', regex: '' });

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async (): Promise<void> => {
    try {
      const result = (await chrome.storage.sync.get([
        'regexPatterns',
        'activePatternId',
      ])) as StorageData;
      const loadedPatterns = result.regexPatterns || [];
      const activeId = result.activePatternId || null;
      
      setPatterns(loadedPatterns);
      setActivePatternId(activeId);
    } catch (error) {
      console.error('Failed to load patterns:', error);
      setPatterns([]);
      setActivePatternId(null);
    }
  };

  const savePatterns = async (
    newPatterns: RegexPattern[],
    newActiveId: string | null
  ): Promise<void> => {
    try {
      await chrome.storage.sync.set({
        regexPatterns: newPatterns,
        activePatternId: newActiveId,
      });
      setPatterns(newPatterns);
      setActivePatternId(newActiveId);
    } catch (error) {
      console.error('Failed to save patterns:', error);
    }
  };

  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const toggleForm = (): void => {
    setShowForm(!showForm);
    if (!showForm) {
      setFormData({ name: '', regex: '' });
      setEditingPatternId(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    const { name, regex } = formData;
    if (!name.trim() || !regex.trim()) {
      alert('パターン名と正規表現を入力してください。');
      return;
    }

    try {
      new RegExp(regex);
    } catch (error) {
      alert('正規表現が無効です。正しい形式で入力してください。');
      return;
    }

    const pattern: RegexPattern = {
      id: editingPatternId || generateId(),
      name: name.trim(),
      regex: regex.trim(),
      createdAt: editingPatternId
        ? patterns.find((p) => p.id === editingPatternId)?.createdAt || Date.now()
        : Date.now(),
    };

    let newPatterns: RegexPattern[];
    let newActiveId = activePatternId;

    if (editingPatternId) {
      const index = patterns.findIndex((p) => p.id === editingPatternId);
      newPatterns = [...patterns];
      if (index >= 0) {
        newPatterns[index] = pattern;
      }
    } else {
      newPatterns = [...patterns, pattern];
      if (newPatterns.length === 1) {
        newActiveId = pattern.id;
      }
    }

    await savePatterns(newPatterns, newActiveId);
    toggleForm();
  };

  const activatePattern = async (patternId: string): Promise<void> => {
    if (activePatternId === patternId) return;
    await savePatterns(patterns, patternId);
  };

  const editPattern = (patternId: string): void => {
    const pattern = patterns.find((p) => p.id === patternId);
    if (!pattern) return;

    setFormData({ name: pattern.name, regex: pattern.regex });
    setEditingPatternId(patternId);
    setShowForm(true);
  };

  const deletePattern = async (patternId: string): Promise<void> => {
    if (!confirm('このパターンを削除しますか？')) return;

    const newPatterns = patterns.filter((p) => p.id !== patternId);
    const newActiveId =
      activePatternId === patternId
        ? newPatterns.length > 0
          ? newPatterns[0].id
          : null
        : activePatternId;

    await savePatterns(newPatterns, newActiveId);
  };

  return (
    <div className="popup-container">
      <div className="header">
        <h1>Hover Copy Tool</h1>
        <p>正規表現パターンの設定</p>
      </div>

      <div className="section">
        <div className="section-title">保存されたパターン</div>
        <div className="pattern-list">
          {patterns.length === 0 ? (
            <div className="no-patterns">パターンが登録されていません</div>
          ) : (
            patterns.map((pattern) => (
              <div
                key={pattern.id}
                className={`pattern-item ${
                  pattern.id === activePatternId ? 'active' : ''
                }`}
              >
                <div className="pattern-header">
                  <div className="pattern-name">{pattern.name}</div>
                  <div className="pattern-actions">
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => activatePattern(pattern.id)}
                      disabled={pattern.id === activePatternId}
                    >
                      {pattern.id === activePatternId ? '使用中' : '使用'}
                    </button>
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
            ))
          )}
        </div>
      </div>

      <div className="toggle-form">
        <button onClick={toggleForm}>
          {showForm ? 'フォームを閉じる' : '新しいパターンを追加'}
        </button>
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="patternRegex">正規表現:</label>
            <input
              type="text"
              id="patternRegex"
              placeholder="例: /user/(\d+)"
              value={formData.regex}
              onChange={(e) => setFormData({ ...formData, regex: e.target.value })}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={toggleForm}>
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