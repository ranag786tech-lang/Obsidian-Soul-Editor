// main.js - Complete Object-Oriented File Manager & Editor

/**
 * FileManager Class - Handles all file operations with cursor position memory
 */
class FileManager {
    constructor() {
        this.files = {};
        this.currentFile = null;
        this.cursorPositions = {}; // Store cursor positions per file
        this.init();
    }

    init() {
        // Load from localStorage or use defaults
        const saved = localStorage.getItem('obsidian_files');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.files = data.files || this.getDefaultFiles();
                this.cursorPositions = data.cursorPositions || {};
            } catch (e) {
                console.error('Failed to load files:', e);
                this.files = this.getDefaultFiles();
            }
        } else {
            this.files = this.getDefaultFiles();
        }
        
        this.renderTabs();
        
        // Set first file as current
        const firstFile = Object.keys(this.files)[0];
        if (firstFile) {
            this.switchFile(firstFile);
        }
    }

    getDefaultFiles() {
        return {
            'index.html': {
                content: '<h1>Hello, Obsidian!</h1>\n<p>Start coding...</p>',
                language: 'html',
                lastModified: new Date().toISOString()
            },
            'style.css': {
                content: 'body {\n    font-family: sans-serif;\n    color: #333;\n}',
                language: 'css',
                lastModified: new Date().toISOString()
            },
            'script.js': {
                content: 'console.log("Hello from Obsidian!");\n\n// Your code here',
                language: 'javascript',
                lastModified: new Date().toISOString()
            }
        };
    }

    saveToDisk() {
        const data = {
            files: this.files,
            cursorPositions: this.cursorPositions
        };
        localStorage.setItem('obsidian_files', JSON.stringify(data));
        this.updateStatus('All files saved ✓');
    }

    updateFileContent(name, content) {
        if (this.files[name]) {
            this.files[name].content = content;
            this.files[name].lastModified = new Date().toISOString();
            
            // Save cursor position for current file
            if (name === this.currentFile && editorManager.editor) {
                const cursor = editorManager.editor.getCursor();
                this.cursorPositions[name] = cursor;
            }
            
            this.saveToDisk();
        }
    }

    switchFile(name) {
        if (!this.files[name]) return;
        
        // Save current file's cursor position before switching
        if (this.currentFile && editorManager.editor) {
            this.cursorPositions[this.currentFile] = editorManager.editor.getCursor();
        }
        
        this.currentFile = name;
        
        // Load the file content into editor
        editorManager.setContent(this.files[name].content, this.files[name].language);
        
        // Restore cursor position if exists
        if (this.cursorPositions[name]) {
            editorManager.editor.setCursor(this.cursorPositions[name]);
        }
        
        this.updateActiveTab(name);
        this.updatePreview();
    }

    addNewFile() {
        const name = prompt('Enter file name (e.g., app.js):', 'new-file.js');
        if (!name) return;
        
        if (this.files[name]) {
            alert('File already exists!');
            return;
        }
        
        // Detect language from extension
        let language = 'html';
        if (name.endsWith('.css')) language = 'css';
        else if (name.endsWith('.js')) language = 'javascript';
        else if (name.endsWith('.json')) language = 'application/json';
        else if (name.endsWith('.md')) language = 'markdown';
        
        this.files[name] = {
            content: '',
            language: language,
            lastModified: new Date().toISOString()
        };
        
        this.renderTabs();
        this.switchFile(name);
    }

    deleteFile(name) {
        if (Object.keys(this.files).length <= 1) {
            alert('Cannot delete the last file!');
            return;
        }
        
        if (confirm(`Delete ${name}?`)) {
            delete this.files[name];
            delete this.cursorPositions[name];
            
            this.renderTabs();
            
            // Switch to first available file
            const firstFile = Object.keys(this.files)[0];
            if (firstFile) {
                this.switchFile(firstFile);
            }
            
            this.saveToDisk();
        }
    }

    renderTabs() {
        const container = document.getElementById('file-tabs');
        container.innerHTML = '';
        
        Object.keys(this.files).forEach(name => {
            const tab = document.createElement('div');
            tab.className = `file-tab ${name === this.currentFile ? 'active' : ''}`;
            tab.dataset.file = name;
            
            // File icon based on extension
            let icon = 'fa-file-code';
            if (name.endsWith('.html')) icon = 'fa-html5';
            else if (name.endsWith('.css')) icon = 'fa-css3';
            else if (name.endsWith('.js')) icon = 'fa-js';
            else if (name.endsWith('.json')) icon = 'fa-brackets-curly';
            
            tab.innerHTML = `
                <span><i class="fas ${icon}"></i> ${name}</span>
                <span class="close-tab" onclick="fileManager.deleteFile('${name}')">
                    <i class="fas fa-times"></i>
                </span>
            `;
            
            tab.onclick = (e) => {
                if (!e.target.classList.contains('close-tab') && 
                    !e.target.parentElement.classList.contains('close-tab')) {
                    this.switchFile(name);
                }
            };
            
            container.appendChild(tab);
        });
        
        // Add new file button
        const newTab = document.createElement('div');
        newTab.className = 'file-tab';
        newTab.innerHTML = `<span><i class="fas fa-plus"></i> New File</span>`;
        newTab.onclick = () => this.addNewFile();
        container.appendChild(newTab);
    }

    updateActiveTab(name) {
        document.querySelectorAll('.file-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.file === name) {
                tab.classList.add('active');
            }
        });
    }

    updateStatus(message) {
        const statusEl = document.getElementById('cursor-position');
        if (statusEl) {
            statusEl.innerHTML = message;
            setTimeout(() => {
                this.updateCursorPosition();
            }, 2000);
        }
    }

    updateCursorPosition() {
        if (editorManager.editor && this.currentFile) {
            const pos = editorManager.editor.getCursor();
            document.getElementById('cursor-position').innerHTML = 
                `Ln ${pos.line + 1}, Col ${pos.ch + 1}`;
        }
    }

    updatePreview() {
        // Combine all files for preview
        const html = this.files['index.html']?.content || '';
        const css = this.files['style.css']?.content || '';
        const js = this.files['script.js']?.content || '';
        
        const previewHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>${css}</style>
            </head>
            <body>
                ${html}
                <script>${js}<\/script>
            </body>
            </html>
        `;
        
        const preview = document.getElementById('preview-frame');
        preview.srcdoc = previewHtml;
    }

    // File operations
    openFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '.html,.css,.js,.json,.md,.txt';
        
        input.onchange = (e) => {
            Array.from(e.target.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    let language = 'html';
                    if (file.name.endsWith('.css')) language = 'css';
                    else if (file.name.endsWith('.js')) language = 'javascript';
                    else if (file.name.endsWith('.json')) language = 'application/json';
                    
                    this.files[file.name] = {
                        content: e.target.result,
                        language: language,
                        lastModified: new Date().toISOString()
                    };
                };
                reader.readAsText(file);
            });
            
            // Wait for all files to load
            setTimeout(() => {
                this.renderTabs();
                this.saveToDisk();
            }, 500);
        };
        
        input.click();
    }

    saveAll() {
        if (this.currentFile && editorManager.editor) {
            this.updateFileContent(this.currentFile, editorManager.editor.getValue());
        }
        this.saveToDisk();
    }

    newFile() {
        this.addNewFile();
    }
}

/**
 * EditorManager Class - Handles CodeMirror instance and features
 */
class EditorManager {
    constructor(fileManager) {
        this.fileManager = fileManager;
        this.editor = null;
        this.init();
    }

    init() {
        this.editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
            mode: 'htmlmixed',
            theme: 'material-darker',
            lineNumbers: true,
            autoCloseTags: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit: 4,
            tabSize: 4,
            lineWrapping: true,
            
            // Auto-complete settings
            extraKeys: {
                'Ctrl-Space': 'autocomplete',
                'Ctrl-S': () => this.fileManager.saveAll(),
                'Ctrl-Enter': () => this.runCode(),
                'Ctrl-F': 'findPersistent',
                'Ctrl-/': 'toggleComment',
                'Ctrl-D': 'deleteLine',
                'Ctrl-Alt-F': 'formatCode'
            },
            
            // Hint options
            hintOptions: {
                completeSingle: false,
                alignWithWord: true,
                closeCharacters: /[\s()\[\]{};:>,]/,
                globalScope: window
            }
        });

        // Track cursor position
        this.editor.on('cursorActivity', () => {
            this.fileManager.updateCursorPosition();
        });

        // Auto-save on changes
        this.editor.on('change', () => {
            if (this.fileManager.currentFile) {
                this.fileManager.updateFileContent(
                    this.fileManager.currentFile, 
                    this.editor.getValue()
                );
            }
        });

        // Enable auto-complete on typing
        this.editor.on('inputRead', (cm, change) => {
            if (change.text.length === 1 && change.text[0].match(/[a-zA-Z0-9_\-$]/)) {
                CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
            }
        });
    }

    setContent(content, language) {
        this.editor.setValue(content || '');
        
        // Set mode based on language
        let mode = 'htmlmixed';
        if (language === 'css') mode = 'css';
        else if (language === 'javascript') mode = 'javascript';
        else if (language === 'application/json') mode = 'application/json';
        else if (language === 'markdown') mode = 'markdown';
        
        this.editor.setOption('mode', mode);
        
        // Refresh to apply mode change
        setTimeout(() => this.editor.refresh(), 10);
    }

    formatCode() {
        try {
            const content = this.editor.getValue();
            const mode = this.editor.getOption('mode');
            
            if (mode === 'application/json') {
                // Format JSON
                const json = JSON.parse(content);
                this.editor.setValue(JSON.stringify(json, null, 2));
            } else {
                // Basic formatting for other languages
                const lines = content.split('\n');
                let formatted = '';
                let indentLevel = 0;
                const indent = '    ';
                
                for (let line of lines) {
                    const trimmed = line.trim();
                    
                    // Decrease indent for closing brackets
                    if (trimmed.match(/^[}\])]/)) {
                        indentLevel = Math.max(0, indentLevel - 1);
                    }
                    
                    // Add line with proper indent
                    formatted += indent.repeat(indentLevel) + trimmed + '\n';
                    
                    // Increase indent for opening brackets
                    if (trimmed.match(/[{\[(]$/)) {
                        indentLevel++;
                    }
                }
                
                this.editor.setValue(formatted);
            }
            
            this.fileManager.updateStatus('Code formatted ✓');
        } catch (e) {
            console.error('Format error:', e);
            this.fileManager.updateStatus('Format failed!');
        }
    }

    runCode() {
        this.fileManager.saveAll();
        this.fileManager.updatePreview();
        this.fileManager.updateStatus('Code executed ✓');
    }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.fileManager = new FileManager();
    window.editorManager = new EditorManager(fileManager);
    
    // Add keyboard shortcut for new file
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            fileManager.newFile();
        }
    });
});
