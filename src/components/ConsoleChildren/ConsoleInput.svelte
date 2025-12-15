<script lang="ts">
  import { onMount, tick } from "svelte";
  import { command as commandList, command_doc } from "$lib/command";

  interface Props {
    inputValue: string;
    on_keydown: (e: KeyboardEvent) => void;
    disabled?: boolean;
  }

  let { on_keydown, inputValue = $bindable(""), disabled = $bindable(false) } = $props();

  $effect(()=>{
    if (!disabled){
      keepFocus()
    }
  })

  let inputElement: HTMLInputElement;
  let textMeasurer: HTMLSpanElement;
  let highlightLayer: HTMLDivElement;
  let highlightHTML = $state("");
  let measuredWidth = $state(0);
  let scrollLeft = $state(0);
  let cursorLeft = $derived(measuredWidth - scrollLeft);
  let activeDoc = $state("");
  let suggestion = $state("");
  let suggestionList: string[] = $state([]);
  let activeSuggestionIndex = $state(0);

  // Keyword definitions for highlighting
  const keywords = {
    command: commandList,
    option: /^-{1,2}[\w-]+/,
    string: /(['"])(?:(?=(\\?))\2.)*?\1/,
    number: /\b\d+\b/,
  };

  function updateHighlight() {
    let text = inputValue;

    // Basic syntax highlighting logic
    // Escape HTML first
    text = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Highlight commands (first word)
    const firstSpaceIndex = text.indexOf(" ");
    const firstWord =
      firstSpaceIndex === -1 ? text : text.substring(0, firstSpaceIndex);
    const rest = firstSpaceIndex === -1 ? "" : text.substring(firstSpaceIndex);

    let formattedFirstWord = firstWord;
    if (keywords.command.includes(firstWord.toLowerCase())) {
      formattedFirstWord = `<span class="hl-command">${firstWord}</span>`;
    }

    // Process the rest for other patterns
    let formattedRest = rest;

    // Highlight strings
    formattedRest = formattedRest.replace(
      /(['"])(?:(?=(\\?))\2.)*?\1/g,
      (match) => {
        return `<span class="hl-string">${match}</span>`;
      }
    );

    // Highlight options/flags (e.g., -v, --verbose)
    formattedRest = formattedRest.replace(/ (-{1,2}[\w-]+)/g, (match, p1) => {
      return ` <span class="hl-option">${p1}</span>`;
    });

    highlightHTML = formattedFirstWord + formattedRest;

    // Update cursor position
    updateCursorPosition();
    // Update doc and suggestion
    updateDocAndSuggestion(firstWord);
  }

  function updateDocAndSuggestion(cmd: string) {
    if (!cmd) {
      activeDoc = "";
      suggestionList = [];
      activeSuggestionIndex = 0;
      return;
    }

    // If full match found in docs, show it
    if (command_doc[cmd as keyof typeof command_doc]) {
      activeDoc = command_doc[cmd as keyof typeof command_doc];
      suggestionList = []; // Exact match, hide suggestions? Or keep showing if multiple prefix matches exist?
      // Usually if exact match is unique, hide list.
      // But if user typed 'task', 'task-list' is a match but also 'task-create'.
      // So we should check if 'cmd' is exactly one of the commands.
    } else {
      activeDoc = "";
    }

    // Filter suggestions
    // Only show suggestions if we are typing the first word (command)
    const isTypingCommand = !inputValue.includes(" ");

    if (isTypingCommand) {
      suggestionList = commandList.filter(
        (c) => c.startsWith(cmd) && c !== cmd
      );
    } else {
      suggestionList = [];
    }

    activeSuggestionIndex = 0;
  }

  function handleInput(e: Event) {
    inputValue = (e.target as HTMLInputElement).value;
    updateHighlight();
  }

  function handleLocalKeydown(e: KeyboardEvent) {
      // Prevent Tab from moving focus
      if (e.key === "Tab") {
          e.preventDefault();
      }

      if (suggestionList.length > 0) {
          if (e.key === "ArrowDown") {
        e.preventDefault();
        activeSuggestionIndex =
          (activeSuggestionIndex + 1) % suggestionList.length;
        return;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        activeSuggestionIndex =
          (activeSuggestionIndex - 1 + suggestionList.length) %
          suggestionList.length;
        return;
      } else if (e.key === "Tab" || e.key === "Enter") {
        // If Enter is pressed while selecting a suggestion, use it.
        // BUT: parent component also listens to Enter to execute command.
        // We need to stop propagation if we are confirming a selection.
        // If list is visible, Enter selects.
        e.preventDefault();
        e.stopPropagation(); // Stop parent from executing immediately

        const selected = suggestionList[activeSuggestionIndex];
        inputValue = selected + " ";
        updateHighlight();

        // Move cursor to end
        tick().then(() => {
          inputElement.selectionStart = inputElement.selectionEnd =
            inputValue.length;
        });

        // Clear suggestions after selection
        suggestionList = [];
        return;
      }
    }

    // Original Tab behavior if no list (or maybe we want Tab to always cycle? Standard is Arrow keys for dropdown)
    // If list is empty but we have a unique suggestion logic from before?
    // Let's stick to dropdown logic.

    if (on_keydown) on_keydown(e);
  }

  function updateCursorPosition() {
    if (!inputElement) return;
    const start = inputElement.selectionStart || 0;

    const textBeforeCursor = inputValue.substring(0, start);
    
    if (textMeasurer) {
      textMeasurer.textContent = textBeforeCursor;
      // Use getBoundingClientRect for sub-pixel precision, or offsetWidth
      measuredWidth = textMeasurer.getBoundingClientRect().width;
      // Sync scrollLeft just in case
      scrollLeft = inputElement.scrollLeft;
      if (highlightLayer) {
        highlightLayer.scrollLeft = scrollLeft;
      }
    }
  }

  function handleScroll(e: Event) {
    scrollLeft = (e.target as HTMLInputElement).scrollLeft;
    if (highlightLayer) {
      highlightLayer.scrollLeft = scrollLeft;
    }
  }

  function handleSelectionChange() {
    updateCursorPosition();
  }

  // Force focus logic
  function keepFocus() {
    if (disabled) return;
    if (document.activeElement !== inputElement) {
      inputElement?.focus();
    }
  }

  $effect(() => {
    // Auto-update highlight when inputValue changes (e.g. cleared by parent)
    updateHighlight();
  });

  onMount(() => {
    inputElement?.focus();
    updateCursorPosition();

    // Persistent focus listener
    document.addEventListener("click", keepFocus);
    window.addEventListener("focus", keepFocus);
    // Listen for cursor movement
    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("click", keepFocus);
      window.removeEventListener("focus", keepFocus);
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  });

  function handleContainerClick() {
    if (disabled) return;
    inputElement?.focus();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="input-container" onclick={handleContainerClick}>
  <span class="prompt">
    Command-line &gt;
    {#if disabled}
      <span class="disable-line">
        Console is disable now , you can active the console with <u><b>alt + c</b></u>
      </span>
    {/if}
  </span>
  <div class="input-wrapper">
    <!-- Highlight layer -->
    <div bind:this={highlightLayer} class="highlight-layer" aria-hidden="true">{@html highlightHTML}</div>
    <!-- Text Measurer -->
    <span bind:this={textMeasurer} class="text-measurer"></span>
    <!-- Custom Cursor -->
    {#if !disabled}
      <div class="custom-cursor" style="left: {cursorLeft}px">_</div>
    {/if}
    <!-- Actual input -->
    <input
      disabled={disabled}
      onkeydown={handleLocalKeydown}
      bind:this={inputElement}
      type="text"
      class="input-console"
      value={inputValue}
      oninput={handleInput}
      onscroll={handleScroll}
      spellcheck="false"
      autocomplete="off"
      onblur={() => setTimeout(keepFocus, 10)}
    />
    <!-- Suggestion Dropdown -->
    {#if suggestionList.length > 0}
      <div class="suggestion-dropdown" style="left: 0; bottom: 100%;">
        {#each suggestionList as item, index}
          <div
            class="suggestion-item {index === activeSuggestionIndex
              ? 'active'
              : ''}"
          >
            {item}
            {#if command_doc[item as keyof typeof command_doc]}
              <span class="suggestion-doc">- {command_doc[item as keyof typeof command_doc]}</span>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
  {#if activeDoc}
    <div class="doc-panel">
      // {activeDoc}
    </div>
  {/if}
</div>

<style lang="less">
  .input-container {
    display: flex;
    align-items: center;
    width: 100%;
    position: relative;
  }

  .prompt {
    color: #00ff00;
    margin-right: 10px;
    white-space: nowrap;
  }

  .input-wrapper {
    position: relative;
    // Remove flex: 1 to allow doc panel to sit next to it?
    // No, let's keep input flexible but doc panel fixed or flexible on the right.
    // Actually if we want doc on the right, we might want input to take available space
    // and doc to take the rest, or doc to float.
    // Let's make input wrapper auto width? No, input needs to be long.
    // Let's use flex-grow for input and allow doc to be on the right.
    flex: 1;
    display: flex;
    align-items: center;
  }

  .doc-panel {
    color: #666;
    margin-left: 20px;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 40%;
    font-style: italic;
    opacity: 0.8;
  }

  .input-console,
  .highlight-layer,
  .text-measurer {
    font-family: inherit;
    font-size: 1.5rem;
    border: none;
    outline: none;
    background: transparent;
    padding: 0;
    margin: 0;
    width: 100%;
    line-height: 1.5;
    letter-spacing: normal;
  }

  .text-measurer {
    position: absolute;
    visibility: hidden;
    white-space: pre;
    width: auto; /* Allow it to grow to measure width */
    height: 0;
    overflow: hidden;
    top: 0;
    left: 0;
  }

  .input-console {
    color: transparent; // Hide text but keep caret
    caret-color: transparent; // Hide native caret
    z-index: 2;
    position: relative;
    
  }

  .custom-cursor {
    position: absolute;
    top: 0;
    color: #00ff00;
    z-index: 1;
    pointer-events: none;
    animation: blink 1s step-end infinite;
    white-space: pre;
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }

  .highlight-layer {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    white-space: pre;
    color: #cccccc; // Default text color
    z-index: 1;
    overflow: hidden;
  }

  // Syntax Highlighting Colors
  :global(.hl-command) {
    color: #ffff00;
    font-weight: bold;
  } // Yellow for commands
  :global(.hl-string) {
    color: #ce9178;
  } // Orange/Brown for strings
  :global(.hl-option) {
    color: #569cd6;
  } // Blue for options

  // Dropdown Styles
  .suggestion-dropdown {
    position: absolute;
    bottom: 100%; // Show above input
    left: 0;
    background: #1e1e1e;
    border: 1px solid #333;
    color: #ccc;
    z-index: 100;
    max-height: 200px;
    overflow-y: auto;
    box-shadow: 0 -5px 15px asdasdrgba(0, 0, 0, 0.5);
    // font-family: inherit;
    font-size: 1rem;
    min-width: 300px;
  }

  .suggestion-item {
    padding: 5px 10px;
    color: aqua;
    display: flex;
    gap: 10px;

    &.active {
      background: #2d2d2d;
      color: #fff;

      .suggestion-doc {
        color: #aaa;
      }
    }
  }

  .suggestion-doc {
    color: #666;
    font-size: 0.9rem;
    font-style: italic;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  }
  
  .disable-line{
    color: red;
    filter: drop-shadow(0 0 5px red);
  }
</style>
