<script lang="ts">
  import { unified } from "unified";
  import remarkParse from "remark-parse";
  import hljs from "highlight.js";
  import "highlight.js/styles/atom-one-dark.css";
  import remarkGfm from "remark-gfm";
  import { db } from "$lib/db";
  import { onMount } from "svelte";

  let processor = unified().use(remarkParse).use(remarkGfm);
  let title = $state("");
  let markdown = $state("");
  let analysisResult: any[] = $state([]);
  let textareaRef: HTMLTextAreaElement | undefined = $state();

  onMount(async () => {
      await db.init();
      await loadContent();
  });

  async function saveContent() {
      let contentToSave = markdown;
      const blobRegex = /!\[(.*?)\]\((blob:.*?)\)/g;
      let match;
      const replacements: { start: number, end: number, replacement: string }[] = [];

      // Find all matches first
      while ((match = blobRegex.exec(contentToSave)) !== null) {
          const fullMatch = match[0];
          const altText = match[1];
          const blobUrl = match[2];
          
          try {
              const response = await fetch(blobUrl);
              const blob = await response.blob();
              const imageId = await db.saveImage(blob);
              
              // We need to replace the blob URL with our custom scheme
              // But we can't modify string while iterating easily if lengths change.
              // So we construct a new string or do replacement.
              // Actually, since we want to keep the current UI state as is (blobs),
              // we only modify the string that goes to DB.
              
              contentToSave = contentToSave.replace(blobUrl, `kuma-image://${imageId}`);
          } catch (e) {
              console.error("Failed to save image:", blobUrl, e);
          }
      }

      await db.saveDocument({
          id: 'default_draft',
          title,
          content: contentToSave,
          updatedAt: Date.now()
      });
      
      alert("保存成功！");
  }

  async function loadContent() {
      const doc = await db.getDocument('default_draft');
      if (doc) {
          title = doc.title;
          let content = doc.content;
          
          const kumaImageRegex = /!\[(.*?)\]\((kuma-image:\/\/.*?)\)/g;
          let match;
          
          // We need to replace async, so splitting or manual reconstruction is needed.
          // Or just loop and replace.
          // Since match loop resets on string change if regex is global? No, it's tricky.
          // Let's match all, then process.
          
          const matches = Array.from(content.matchAll(kumaImageRegex));
          
          for (const m of matches) {
              const fullMatch = m[0];
              const url = m[2];
              const imageId = url.replace('kuma-image://', '');
              
              try {
                  const blob = await db.getImage(imageId);
                  if (blob) {
                      const blobUrl = URL.createObjectURL(blob);
                      content = content.replace(url, blobUrl);
                  }
              } catch (e) {
                  console.error("Failed to load image:", imageId, e);
              }
          }
          
          markdown = content;
          input_md();
      }
  }

  let ast = $derived.by(() => {
    try {
      return processor.parse(markdown);
    } catch (e) {
      return { type: "root", children: [] };
    }
  });

  function keydown(e: KeyboardEvent) {
    if (e.key !== "Tab") return;

    const textarea = e.target as HTMLTextAreaElement;
    if (!textarea) return;

    e.preventDefault();

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    textarea.value =
      textarea.value.slice(0, start) + "  " + textarea.value.slice(end);

    textarea.selectionStart = textarea.selectionEnd = start + 1;
    // Trigger update since direct DOM manipulation doesn't trigger Svelte binding update immediately if needed
    markdown = textarea.value;
    input_md();
  }

  function handlePaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (!blob) continue;

        const url = URL.createObjectURL(blob);
        const insertText = `\n![image](${url})\n`;

        if (textareaRef) {
          const start = textareaRef.selectionStart;
          const end = textareaRef.selectionEnd;
          const text = textareaRef.value;

          markdown = text.slice(0, start) + insertText + text.slice(end);
          
          // Update AST analysis immediately
          setTimeout(() => input_md(), 0);
        }
        return; // Handle only the first image found
      }
    }
  }

  function getText(node: any): string {
    if (node.value) return node.value;
    if (node.children) return node.children.map(getText).join("");
    return "";
  }

  function parseContent(text: string) {
    let checked = false;
    let hasCheckbox = false;
    let cleanText = text;

    if (text.startsWith("[]")) {
      checked = false;
      hasCheckbox = true;
      cleanText = text.slice(2).trim();
    } else if (text.startsWith("[.]") || text.startsWith("[x]")) {
      checked = true;
      hasCheckbox = true;
      cleanText = text.slice(3).trim();
    }
    return { text: cleanText, checked, hasCheckbox };
  }

  function flattenNodes(nodes: any[], depth: number = 0): any[] {
    let results: any[] = [];

    for (const node of nodes) {
      if (!node) continue;

      if (node.type === "heading") {
        results.push({
          node: "title",
          depth: node.depth,
          text: getText(node),
          layer: depth,
        });
      } else if (node.type === "blockquote") {
        results.push({
          node: "blockquote",
          text: getText(node),
          layer: depth,
        });
      } else if (node.type === "code") {
        results.push({
          node: "code",
          lang: node.lang,
          value: node.value,
          layer: depth,
        });
      } else if (node.type === "list") {
        if (node.children) {
          results = results.concat(flattenNodes(node.children, depth));
        }
      } else if (node.type === "listItem") {
        const contentNodes = node.children
          ? node.children.filter((c: any) => c.type !== "list")
          : [];
        const listNodes = node.children
          ? node.children.filter((c: any) => c.type === "list")
          : [];

        const rawText = contentNodes.map(getText).join(" ").trim();
        const { text, checked, hasCheckbox } = parseContent(rawText);

        results.push({
          node: "listItem",
          text: text,
          layer: depth,
          checked: checked,
          hasCheckbox: node.checked !== null || hasCheckbox,
        });

        if (listNodes.length > 0) {
          results = results.concat(flattenNodes(listNodes, depth + 1));
        }
      } else if (node.type === "paragraph" && depth === 1) {
        const hasImage = node.children?.some((c: any) => c.type === 'image');
        
        if (hasImage) {
            for (const child of node.children) {
                if (child.type === 'image') {
                    results.push({
                        node: 'image',
                        url: child.url,
                        alt: child.alt,
                        layer: depth
                    });
                } else {
                    // Handle text around images simply for now
                    const text = getText(child).trim();
                    if (text) {
                        results.push({
                            node: 'paragraph',
                            text: text,
                            layer: depth,
                            checked: false,
                            hasCheckbox: false
                        });
                    }
                }
            }
        } else {
            const rawText = getText(node);
            const { text, checked, hasCheckbox } = parseContent(rawText);

            results.push({
              node: "paragraph",
              text: text,
              layer: depth,
              checked: checked,
              hasCheckbox: hasCheckbox,
            });
        }
      }
    }
    return results;
  }

  function input_md() {
    if (!ast || !ast.children) return;
    // Start at layer 1 as per user request
    analysisResult = flattenNodes(ast.children, 1);
  }
  let showAnalysis = $state(true);
  let renderContentRef: HTMLDivElement | undefined = $state();
  
  function handleScroll(e: Event) {
    if (!textareaRef || !renderContentRef || !showAnalysis) return;
    
    const target = e.target as HTMLTextAreaElement;
    const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight);
    
    // Sync render content scroll
    renderContentRef.scrollTop = percentage * (renderContentRef.scrollHeight - renderContentRef.clientHeight);
  }

  function toggleAnalysis() {
    showAnalysis = !showAnalysis;
  }

  function getHighlightedCode(code: string, lang: string | undefined) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  }
</script>

<div class="edit-content">
  <input
    type="text"
    class="title"
    bind:value={title}
    placeholder="input your title here..."
  />
  <div class="body-content">
    <div class="textarea-wrapper" style:width={showAnalysis ? '50%' : '100%'}>
        <textarea
          id="editorjs"
          class="md-edit-content"
          bind:value={markdown}
          bind:this={textareaRef}
          oninput={input_md}
          onkeydown={keydown}
          onpaste={handlePaste}
          onscroll={handleScroll}
        />
    </div>
    {#if showAnalysis}
      <div class="render-content" bind:this={renderContentRef}>
        <div class="panel markdown-body">
          <h3>实时预览</h3>
          {#each analysisResult as item}
            <div
              style="margin-left: {(item.layer - 1) *
                20}px; border-left: 1px solid #444; padding-left: 10px; margin-bottom: 5px;"
            >
              {#if item.node === "title"}
                <div
                  style="font-weight: bold; font-size: {2 -
                    item.depth * 0.1}rem; color: #fff;"
                >
                  {"#".repeat(item.depth)}
                  {item.text}
                  <span style="font-size: 0.8rem; color: #888;"
                    >(Layer: {item.layer})</span
                  >
                </div>
              {:else if item.node === "listItem"}
                <div style="display: flex; align-items: center; gap: 8px;">
                  {#if item.hasCheckbox}
                    <input type="checkbox" checked={item.checked} disabled />
                  {:else}
                    <span>•</span>
                  {/if}
                  <span>{item.text}</span>
                  <span style="font-size: 0.8rem; color: #666;"
                    >(Layer: {item.layer})</span
                  >
                </div>
              {:else if item.node === "paragraph"}
                <div style="margin-bottom: 8px;">
                  <span>{item.text}</span>
                </div>
              {:else if item.node === "image"}
                <div style="margin-bottom: 8px;">
                    <img src={item.url} alt={item.alt} style="max-width: 100%; border-radius: 4px; border: 1px solid #444;" />
                </div>
              {:else if item.node === "code"}
                <div class="code-block-wrapper">
                  <div class="code-header">
                    <div class="mac-buttons">
                      <div class="mac-button red"></div>
                      <div class="mac-button yellow"></div>
                      <div class="mac-button green"></div>
                    </div>
                    <div class="lang-display">{item.lang || "text"}</div>
                  </div>
                  <pre><code class="hljs"
                      >{@html getHighlightedCode(item.value, item.lang)}</code
                    ></pre>
                </div>
              {:else if item.node === "blockquote"}
                <blockquote>{item.text}</blockquote>
              {:else}
                <div>{item.text || JSON.stringify(item)}</div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <div class="action-buttons">
        <button class="action-btn" onclick={saveContent}>保存</button>
        <button class="action-btn" onclick={toggleAnalysis}>
          {showAnalysis ? "取消预览" : "实时预览"}
        </button>
    </div>
  </div>
</div>

<style lang="less">
  @import "../../../lib/style/markdown.less";

  .action-buttons {
    position: absolute;
    top: 10px;
    right: 20px;
    z-index: 10;
    display: flex;
    gap: 10px;
  }

  .action-btn {
    background: #333;
    color: white;
    border: 1px solid #555;
    padding: 5px 10px;
    cursor: pointer;
    font-family: "像素";
    transition: all 0.2s;

    &:hover {
      background: #444;
      border-color: #777;
    }
    
    &:active {
        background: #222;
    }
  }
  .edit {
    border: none;
    font-family: "像素";
    outline: none;
    color: white;
    background-color: transparent;

    &::placeholder {
      color: #9ece6a66;
    }
  }
  .edit-content {
    display: flex;
    flex-direction: column;
    gap: 30px;
    width: 95%; /* Increased width */

    margin: auto;
    .title {
      font-size: 2.2rem;
      padding: 20px 0;
      box-sizing: border-box;
      .edit;
    }
  }

  .body-content {
    display: flex;
    gap: 20px;
    width: 100%;
    position: relative;
    height: 80vh;

    font-family: "像素";
    font-size: 1.4rem;
  }

  .render-content {
    font-family: "像素";
    font-size: 1rem;
    color: #a9b1d6;
    width: 50%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;

    .panel {
      background: rgba(0, 0, 0, 0.3);
      padding: 10px;
      border-radius: 4px;

      h3 {
        margin-top: 0;
        color: #7aa2f7;
        border-bottom: 1px solid #444;
        padding-bottom: 5px;
      }

      pre {
        white-space: pre-wrap;
        word-wrap: break-word;
      }
    }
  }

    .md-edit-content {
    font-family: "像素";
    font-size: 1.4rem;
    height: 100%;
    width: 100%;
    resize: none;
    background-color: rgba(255, 255, 255, 0.05);
    outline: none;
    color: white;
    padding: 20px;
    box-sizing: border-box;
    border: 1px solid #444;
    border-radius: 4px;
  }

  .textarea-wrapper {
      position: relative;
      height: 100%;
      transition: width 0.2s;
  }

  .code-block-wrapper {
        background-color: #1e1e1e;
        border-radius: 8px;
        overflow: hidden;
        margin-top: 10px;
        border: 1px solid #333;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);

        .code-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: #252526;
            padding: 8px 12px;
            border-bottom: 1px solid #333;

            .mac-buttons {
                display: flex;
                gap: 6px;
                
                .mac-button {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    
                    &.red { background-color: #ff5f56; }
                    &.yellow { background-color: #ffbd2e; }
                    &.green { background-color: #27c93f; }
                }
            }

            .lang-display {
                color: #888;
                font-size: 0.8rem;
                font-family: monospace;
                text-transform: uppercase;
            }
        }

        pre {
            margin: 0;
            padding: 12px;
            overflow-x: auto;
            background-color: #1e1e1e !important;
            
            code {
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                font-size: 0.9rem;
                background: transparent;
                padding: 0;
                line-height: 1.5;
            }
        }
    }
</style>
