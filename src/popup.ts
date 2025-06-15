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

class PopupManager {
  private patterns: RegexPattern[] = [];
  private activePatternId: string | null = null;
  private editingPatternId: string | null = null;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadPatterns();
    this.renderPatterns();
    this.attachEventListeners();
  }

  private async loadPatterns(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get(['regexPatterns', 'activePatternId']) as StorageData;
      this.patterns = result.regexPatterns || [];
      this.activePatternId = result.activePatternId || null;
    } catch (error) {
      console.error('Failed to load patterns:', error);
      this.patterns = [];
      this.activePatternId = null;
    }
  }

  private async savePatterns(): Promise<void> {
    try {
      await chrome.storage.sync.set({
        regexPatterns: this.patterns,
        activePatternId: this.activePatternId
      });
    } catch (error) {
      console.error('Failed to save patterns:', error);
    }
  }

  private attachEventListeners(): void {
    const toggleFormBtn = document.getElementById('toggleFormBtn') as HTMLButtonElement;
    const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
    const cancelBtn = document.getElementById('cancelBtn') as HTMLButtonElement;

    toggleFormBtn.addEventListener('click', () => {
      this.toggleForm();
    });

    saveBtn.addEventListener('click', () => {
      this.savePattern();
    });

    cancelBtn.addEventListener('click', () => {
      this.cancelEdit();
    });
  }

  private toggleForm(): void {
    const form = document.getElementById('patternForm') as HTMLElement;
    const toggleBtn = document.getElementById('toggleFormBtn') as HTMLButtonElement;
    
    if (form.style.display === 'none') {
      form.style.display = 'block';
      toggleBtn.textContent = 'フォームを閉じる';
      this.clearForm();
    } else {
      form.style.display = 'none';
      toggleBtn.textContent = '新しいパターンを追加';
      this.editingPatternId = null;
    }
  }

  private clearForm(): void {
    const patternNameInput = document.getElementById('patternName') as HTMLInputElement;
    const patternRegexInput = document.getElementById('patternRegex') as HTMLInputElement;
    
    patternNameInput.value = '';
    patternRegexInput.value = '';
    this.editingPatternId = null;
  }

  private async savePattern(): Promise<void> {
    const patternNameInput = document.getElementById('patternName') as HTMLInputElement;
    const patternRegexInput = document.getElementById('patternRegex') as HTMLInputElement;
    
    const name = patternNameInput.value.trim();
    const regex = patternRegexInput.value.trim();

    if (!name || !regex) {
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
      id: this.editingPatternId || this.generateId(),
      name: name,
      regex: regex,
      createdAt: this.editingPatternId ? 
        this.patterns.find(p => p.id === this.editingPatternId)?.createdAt || Date.now() : 
        Date.now()
    };

    if (this.editingPatternId) {
      const index = this.patterns.findIndex(p => p.id === this.editingPatternId);
      if (index >= 0) {
        this.patterns[index] = pattern;
      }
    } else {
      this.patterns.push(pattern);
      if (this.patterns.length === 1) {
        this.activePatternId = pattern.id;
      }
    }

    await this.savePatterns();
    this.renderPatterns();
    this.toggleForm();
  }

  private cancelEdit(): void {
    this.toggleForm();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private renderPatterns(): void {
    const container = document.getElementById('patternList') as HTMLElement;
    
    if (this.patterns.length === 0) {
      container.innerHTML = '<div class="no-patterns">パターンが登録されていません</div>';
      return;
    }

    const patternsHTML = this.patterns.map(pattern => `
      <div class="pattern-item ${pattern.id === this.activePatternId ? 'active' : ''}" data-id="${pattern.id}">
        <div class="pattern-header">
          <div class="pattern-name">${this.escapeHtml(pattern.name)}</div>
          <div class="pattern-actions">
            <button class="btn btn-primary btn-small activate-btn" data-id="${pattern.id}">
              ${pattern.id === this.activePatternId ? '使用中' : '使用'}
            </button>
            <button class="btn btn-secondary btn-small edit-btn" data-id="${pattern.id}">編集</button>
            <button class="btn btn-secondary btn-small delete-btn" data-id="${pattern.id}">削除</button>
          </div>
        </div>
        <div class="pattern-regex">${this.escapeHtml(pattern.regex)}</div>
      </div>
    `).join('');

    container.innerHTML = patternsHTML;
    this.attachPatternEvents();
  }

  private attachPatternEvents(): void {
    const activateButtons = document.querySelectorAll('.activate-btn') as NodeListOf<HTMLButtonElement>;
    const editButtons = document.querySelectorAll('.edit-btn') as NodeListOf<HTMLButtonElement>;
    const deleteButtons = document.querySelectorAll('.delete-btn') as NodeListOf<HTMLButtonElement>;

    activateButtons.forEach(btn => {
      btn.addEventListener('click', (e: MouseEvent) => {
        const target = e.target as HTMLButtonElement;
        const patternId = target.dataset.id;
        if (patternId) {
          this.activatePattern(patternId);
        }
      });
    });

    editButtons.forEach(btn => {
      btn.addEventListener('click', (e: MouseEvent) => {
        const target = e.target as HTMLButtonElement;
        const patternId = target.dataset.id;
        if (patternId) {
          this.editPattern(patternId);
        }
      });
    });

    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e: MouseEvent) => {
        const target = e.target as HTMLButtonElement;
        const patternId = target.dataset.id;
        if (patternId) {
          this.deletePattern(patternId);
        }
      });
    });
  }

  private async activatePattern(patternId: string): Promise<void> {
    if (this.activePatternId === patternId) return;
    
    this.activePatternId = patternId;
    await this.savePatterns();
    this.renderPatterns();
  }

  private editPattern(patternId: string): void {
    const pattern = this.patterns.find(p => p.id === patternId);
    if (!pattern) return;

    const patternNameInput = document.getElementById('patternName') as HTMLInputElement;
    const patternRegexInput = document.getElementById('patternRegex') as HTMLInputElement;
    
    patternNameInput.value = pattern.name;
    patternRegexInput.value = pattern.regex;
    this.editingPatternId = patternId;

    const form = document.getElementById('patternForm') as HTMLElement;
    const toggleBtn = document.getElementById('toggleFormBtn') as HTMLButtonElement;
    form.style.display = 'block';
    toggleBtn.textContent = 'フォームを閉じる';
  }

  private async deletePattern(patternId: string): Promise<void> {
    if (!confirm('このパターンを削除しますか？')) return;

    this.patterns = this.patterns.filter(p => p.id !== patternId);
    
    if (this.activePatternId === patternId) {
      this.activePatternId = this.patterns.length > 0 ? this.patterns[0].id : null;
    }

    await this.savePatterns();
    this.renderPatterns();
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

new PopupManager();