<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as monaco from 'monaco-editor';
  import 'monaco-editor/min/vs/editor/editor.main.css';
  import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
  import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
  import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
  import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
  import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

  let { isOpen = $bindable(false), code = $bindable(''), language = $bindable('javascript'), onInsert } = $props();

  let editorContainer: HTMLElement;
  let editor: monaco.editor.IStandaloneCodeEditor;

  // Initialize Monaco Environment
  if (typeof self !== 'undefined' && !self.MonacoEnvironment) {
    self.MonacoEnvironment = {
      getWorker(_, label) {
        if (label === 'json') {
          return new jsonWorker();
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
          return new cssWorker();
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
          return new htmlWorker();
        }
        if (label === 'typescript' || label === 'javascript') {
          return new tsWorker();
        }
        return new editorWorker();
      }
    };
  }

  $effect(() => {
    if (isOpen && editorContainer && !editor) {
      initEditor();
    } else if (!isOpen && editor) {
        // Keep editor instance if we want to preserve state, or dispose?
        // For now, let's keep it but maybe we need to layout it again if shown
    }
  });

  function initEditor() {
    editor = monaco.editor.create(editorContainer, {
      value: code,
      language: language,
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily: "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
      // Disable validations to prevent "red squiggles" for missing dependencies
      diagnosticsOptions: {
          noSemanticValidation: true,
          noSyntaxValidation: true
      }
    });

    // Specific configuration for languages to disable diagnostics
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true
    });
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true
    });
    
    // For Python and others, Monaco usually doesn't have deep semantic validation by default in browser
    // without a language server, but we can try to minimize visual noise.
    // However, the red squiggles often come from syntax errors or basic checks.
    // We can also disable 'renderValidationDecorations' in editor options.
    editor.updateOptions({
        renderValidationDecorations: 'off'
    });

    editor.onDidChangeModelContent(() => {
      code = editor.getValue();
    });
  }
  
  // Watch for language changes to update editor model
  $effect(() => {
      if (editor && language) {
          const model = editor.getModel();
          if (model) {
              monaco.editor.setModelLanguage(model, language);
          }
      }
  });

  // Watch for code changes from outside (if any, though usually one-way for this modal)
  // If we bind code, we might need to be careful about loops. 
  // For this simple modal, we assume code is passed in when opened.

  function handleClose() {
    isOpen = false;
    if (editor) {
        editor.dispose();
        editor = undefined;
    }
  }

  function handleInsert() {
    if (onInsert) {
        onInsert(editor ? editor.getValue() : code);
    }
    handleClose();
  }

  onDestroy(() => {
    if (editor) {
      editor.dispose();
    }
  });
</script>

{#if isOpen}
  <div class="modal-overlay" onclick={handleClose} role="button" tabindex="0" onkeydown={(e) => e.key === 'Escape' && handleClose()}>
    <div class="modal-content" onclick={(e) => e.stopPropagation()} role="document" tabindex="0" onkeydown={() => {}}>
      <div class="modal-header">
        <h3>代码编辑器</h3>
        <div class="controls">
            <select bind:value={language} class="lang-select">
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="json">JSON</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="sql">SQL</option>
                <option value="markdown">Markdown</option>
            </select>
            <button class="close-btn" onclick={handleClose}>×</button>
        </div>
      </div>
      <div class="editor-wrapper" bind:this={editorContainer}></div>
      <div class="modal-footer">
        <button class="cancel-btn" onclick={handleClose}>取消</button>
        <button class="insert-btn" onclick={handleInsert}>插入代码</button>
      </div>
    </div>
  </div>
{/if}

<style lang="less">
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(2px);
  }

  .modal-content {
    background: #1e1e1e;
    width: 80%;
    height: 80%;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    border: 1px solid #333;
    animation: slideIn 0.2s ease-out;
    font-family: "像素", "Fira Code", monospace;
  }

  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    border-bottom: 1px solid #333;
    background: #252526;
    border-radius: 8px 8px 0 0;

    h3 {
      margin: 0;
      color: #cccccc;
      font-family: "像素", sans-serif;
      font-size: 1rem;
    }

    .controls {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    .lang-select {
        background: #3c3c3c;
        color: #cccccc;
        border: 1px solid #333;
        padding: 4px 8px;
        border-radius: 4px;
        outline: none;
        cursor: pointer;
        font-family: "像素", sans-serif;
        
        &:hover {
            border-color: #555;
        }
    }

    .close-btn {
      background: none;
      border: none;
      color: #cccccc;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0 5px;
      line-height: 1;
      
      &:hover {
        color: white;
      }
    }
  }

  .editor-wrapper {
    flex: 1;
    overflow: hidden;
  }

  .modal-footer {
    padding: 10px 20px;
    border-top: 1px solid #333;
    background: #252526;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    border-radius: 0 0 8px 8px;

    button {
      padding: 6px 16px;
      border-radius: 4px;
      cursor: pointer;
      border: none;
      font-size: 0.9rem;
      transition: background 0.2s;
      font-family: "像素", sans-serif;
    }

    .cancel-btn {
      background: #3c3c3c;
      color: #cccccc;
      
      &:hover {
        background: #4c4c4c;
      }
    }

    .insert-btn {
      background: #0e639c;
      color: white;
      
      &:hover {
        background: #1177bb;
      }
    }
  }
</style>