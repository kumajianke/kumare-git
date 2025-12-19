<script lang="ts">
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";

  interface Items{
    value : string,
    icon ?: string,
    title ?: string,
  }

  interface Props {
    items?: Items[];
    width?: string;
    placeholder?: string;
    value?: string;
    onSelect?: (item: string) => void;
  }

  let {
    items = [],
    width = "200",
    placeholder = "Select...",
    value = $bindable(""),
    onSelect = ()=>{},
  } = $props();

  let input_element = $state();
  let isOpen = $state(false);
  let container: HTMLDivElement;
  let dropdownNode: HTMLDivElement | undefined = $state();
  let finalWidth = $derived(!isNaN(Number(width)) ? width + "px" : width);
  let inputValue = $state("");
  let activeHighlightIndex = $state(0);

  let filteredItems = $derived.by(() => {
    if (!inputValue) return items;
    return items.filter(i => i.toLowerCase().startsWith(inputValue.toLowerCase()));
  });

  $effect(() => {
     // dependency on filteredItems length to reset index if needed, 
     // but mainly when inputValue changes, filteredItems changes.
     // We want to reset index when the list changes drastically, 
     // but if we are just navigating, we don't want to reset.
     // Actually, if filteredItems changes (due to input), we usually want to reset to 0.
     filteredItems;
     isOpen;
     activeHighlightIndex = 0;
  });

  $effect(() => {
    if (value !== undefined) {
      inputValue = value;
    }
  });

  function toggle() {
    isOpen = !isOpen;
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    inputValue = target.value;
    value = inputValue; 
    isOpen = true; 
    if (onSelect) onSelect(inputValue); 
    let input_element_as_html_input_element = input_element as HTMLInputElement;
    if(input_element_as_html_input_element) input_element_as_html_input_element.focus();
  }

  function handleBlur() {
    isOpen = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            isOpen = true;
            activeHighlightIndex = 0;
            e.preventDefault();
        } else if (e.key === "Enter") {
             // If closed and enter is pressed, maybe open? Or just submit?
             // Usually Enter on input submits the form or does nothing if not open.
             // If we want to support "open on enter", we can do it.
             // But user requirement is "Select data ... using up/down keys".
             // Let's stick to Arrow keys opening it.
        }
        return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeHighlightIndex = (activeHighlightIndex + 1) % filteredItems.length;
      scrollToItem(activeHighlightIndex);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeHighlightIndex = (activeHighlightIndex - 1 + filteredItems.length) % filteredItems.length;
      scrollToItem(activeHighlightIndex);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeHighlightIndex >= 0 && activeHighlightIndex < filteredItems.length) {
        select(filteredItems[activeHighlightIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      isOpen = false;
    }
  }

  function scrollToItem(index: number) {
       // Use setTimeout to ensure DOM is updated if we were creating items (not the case here usually, just class change)
       // But just in case
       setTimeout(() => {
         if (dropdownNode) {
             const items = dropdownNode.querySelectorAll('.dropdown-item');
             if (items[index]) {
                 items[index].scrollIntoView({ block: 'nearest' });
             }
         }
       }, 0);
   }

  function select(item: string) {
    inputValue = item;
    value = item;
    isOpen = false;
    if (onSelect) onSelect(item);
  }

  function portal(node: HTMLElement) {
    document.body.appendChild(node);
    
    // Initial position update
    updatePosition(node);
    
    const update = () => updatePosition(node);

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true); // Capture phase to handle parent scrolling

    return {
      destroy() {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
        window.removeEventListener('resize', update);
        window.removeEventListener('scroll', update, true);
      }
    };
  }

  function updatePosition(node: HTMLElement) {
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    node.style.top = `${rect.bottom + scrollTop + 2}px`;
    node.style.left = `${rect.left + scrollLeft}px`;
    node.style.width = `${rect.width}px`;
  }

  function highlightMatch(text: string, query: string) {
    if (!query) return text;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    if (lowerText.startsWith(lowerQuery)) {
      const match = text.substring(0, query.length);
      const rest = text.substring(query.length);
      return `<span class="highlight">${match}</span>${rest}`;
    }
    return text;
  }

  function handleOutsideClick(event: MouseEvent) {
    // Check if click is inside container OR inside the dropdown (which is now in body)
    const target = event.target as Node;
    const dropdown = document.querySelector('.dropdown-list-portal');
    
    if (container && !container.contains(target)) {
        if (dropdown && dropdown.contains(target)) {
            // Click inside dropdown, don't close (let select handler do it)
            return;
        }
        isOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  });
</script>

<div class="selector-container" bind:this={container} style:width={finalWidth}>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="input-wrapper" onclick={toggle} class:active={isOpen}>
    <input
    bind:this={input_element}
      type="text"
      bind:value={inputValue}
      oninput={handleInput}
      {placeholder}
      class="selector-input"
      onfocus={handleInput}
      onkeydown={handleKeydown}
      onblur={handleBlur}
    />
    <div class="input-icon" class:rotated={isOpen}>
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="2" />
      </svg>
    </div>
  </div>

  {#if isOpen}
    <div class="dropdown-list dropdown-list-portal" 
      bind:this={dropdownNode} 
      use:portal 
      transition:slide={{ duration: 150 }}
      onmousedown={(e) => e.preventDefault()}
    >
      {#if filteredItems.length > 0}
        {#each filteredItems as item, index}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="dropdown-item"
            class:selected={item === value}
            class:highlighted={index === activeHighlightIndex}
            onclick={() => select(item)}
          >
            {@html highlightMatch(item, inputValue)}
          </div>
        {/each}
      {:else}
        <div class="dropdown-item empty">No matches</div>
      {/if}
    </div>
  {/if}
</div>

<style lang="less">
  .selector-container {
    position: relative;
    font-family: "像素", monospace;
    display: inline-block;
  }

  .input-wrapper {
    position: relative;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      filter: drop-shadow(0 0 2px #3AE682);
    }

    &.active {
      .selector-input {
        border-color: #3AE682;
        box-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
      }
    }
  }

  .selector-input {
    display: block;
    width: 100%;
    background: rgba(5, 5, 5, 0.9);
    outline: none;
    color: #3AE682; // Green text
    font-family: inherit;
    border: 1px solid white;
    border-radius: 4px; // Slightly rounded
    padding: 10px 12px;
    padding-right: 30px; // Space for icon
    font-size: 1.2rem;
    box-sizing: border-box;
    cursor: text; /* Changed from pointer to text */
    transition: all 0.2s;

    &::placeholder {
      color: #005500;
    }

    &:focus{
        border: 1px solid #00aa00
    }
  }

  .input-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #3AE682;
    pointer-events: none;
    transition: transform 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;

    &.rotated {
      transform: translateY(-50%) rotate(180deg);
    }
  }

  .dropdown-list {
    position: absolute;
    /* top and left will be set via JS */
    /* width will be set via JS */
    background: #050505;
    border: 1px solid #3AE682;
    border-top: none;
    border-radius: 0 0 4px 4px;
    box-sizing: border-box;
    z-index: 9999; /* Higher z-index for portal */
    max-height: 200px;
    overflow-y: auto;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.5);
    /* Removed top: 100% and left: 0 since it's now portal'd */
    
    /* Custom Scrollbar */
    &::-webkit-scrollbar {
      width: 8px;
    }
    &::-webkit-scrollbar-track {
      background: #001100;
    }
    &::-webkit-scrollbar-thumb {
      background: rgb( 58,230,130);
      border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: rgb( 58,230,130);
    }
  }

  .dropdown-item {
    padding: 8px 12px;
    color: #aaaaaa;
    cursor: pointer;
    transition: all 0.1s;
    border-bottom: 1px solid #002200;
    font-family: "像素";
    font-size: 1.2rem;
    
    &:last-child {
      border-bottom: none;
    }

    /* Highlight matching text */
    :global(.highlight) {
      color: #fff;
      font-weight: bold;
      text-shadow: 0 0 2px #fff;
    }

    &:hover,
    &.selected,
    &.highlighted {
      background: rgba(0, 255, 0, 0.1);
      color: #ffffff;
      padding-left: 16px; // Slight movement effect
    }

    &.empty {
      color: #555;
      font-style: italic;
      cursor: default;
      &:hover {
        background: transparent;
        padding-left: 12px;
      }
    }
  }
</style>
