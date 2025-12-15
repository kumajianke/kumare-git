<script lang="ts">
  import { onMount } from "svelte";
  import { activeWorkspace } from "$lib/bus";

  interface ItemSide {
    title?: string; // Support title from layout
    name?: string;  // Support name as fallback
    group: string;
    onClick?: () => void;
    icon?: string;
  }

  interface Props {
    width?: string;
    height?: string;

    position_top?: number;
    position_left?: number;
    position_right?: number;
    position_bottom?: number;
    position_type?: string;

    items: ItemSide[];
    title?: string;
    subtitle?: string;
    title_icon?: string;
  }

  let {
    position_left = 0,
    position_top = 0,
    position_right = null,
    position_bottom = null,
    position_type = "left",
    items = $bindable([]),
    title = "",
    subtitle = "",
    title_icon = "",
    width = "223px",
    height = "100vh",
  } = $props();

  let activeIndex = $state(0);
  let isKeyboardActive = $derived($activeWorkspace === 'side');

  // Group items
  let groupedItems = $derived.by(() => {
    const groups: Record<string, ItemSide[]> = {};
    items.forEach(item => {
      const g = item.group || "default";
      if (!groups[g]) groups[g] = [];
      groups[g].push(item);
    });
    return groups;
  });

  // Flattened list for rotation
  let flatItems = $derived(items);

  function handleKeydown(event: KeyboardEvent) {
    if (isKeyboardActive) {
      if (event.code === "ArrowDown") {
        event.preventDefault();
        rotateSelection(1);
      } else if (event.code === "ArrowUp") {
        event.preventDefault();
        rotateSelection(-1);
      } else if (event.code === "Enter") {
        event.preventDefault();
        confirmSelection();
      } else if (event.code === "Escape") {
        event.preventDefault();
        activeWorkspace.set(null);
      }
    }
  }

  function rotateSelection(direction: number) {
    if (flatItems.length === 0) return;
    activeIndex = (activeIndex + direction + flatItems.length) % flatItems.length;
  }

  function confirmSelection() {
    const item = flatItems[activeIndex];
    if (item && item.onClick) item.onClick();
  }

  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  });

  function getDisplayName(item: ItemSide) {
    return item.title || item.name || "Unknown";
  }
</script>

<div
  class="side {position_type}"
  style:left={position_left}
  style:top={position_top}
  style:right={position_right}
  style:bottom={position_bottom}
  style:width
  style:height
>
  <div class="scanlines"></div>
  
  {#if title !== ""}
    <div class="title-area">
      {#if title_icon}
        <img
          src={title_icon}
          alt=""
          style="width: 60px; height: 60px; margin-right: 10px;"
          class="image-icon"
        />
      {/if}
      <div class="title-text">
        <span class="main-title-text">{title}</span>
        <span class="sub-title-text">{subtitle}</span>
      </div>
    </div>
  {/if}

  <div class="menu-content">
    <div class="alt-tip"><code>alt + r</code> enter the keyboard mode: {isKeyboardActive} </div>
    {#each Object.entries(groupedItems) as [groupName, groupItems]}
      <div class="group-header">
        // {groupName.toUpperCase()}
      </div>
      <div class="group-items">
        {#each groupItems as item}
          {@const index = flatItems.indexOf(item)}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div 
            class="menu-item" 
            class:active={index === activeIndex}
            role="button"
            tabindex="0"
            onclick={() => {
              activeIndex = index;
              if(item.onClick) item.onClick();
            }}
          >
            <div class="item-icon">
                <!-- Simple SVG Placeholder -->
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H10V10H4V4Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M14 4H20V10H14V4Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M4 14H10V20H4V14Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M14 14H20V20H14V14Z" stroke="currentColor" stroke-width="2"/>
                </svg>
            </div>
            <div class="item-text">
                {getDisplayName(item)}
            </div>
             {#if index === activeIndex}
                <div class="act-tag">&lt;ACT&gt;</div>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style lang="less">

  .side {
    
    position: absolute;
    content: "";
    background: #050505; // Dark background
    box-sizing: border-box;
    overflow: hidden;
    z-index: 100;

    &.side.left {
      border-right: 1px solid #00ff00cc;
    }
    &.side.right {
      border-left: 1px solid #00ff00cc;
    }

    // CRT Moiré / Scanline Effect
    .scanlines {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0),
        rgba(255, 255, 255, 0) 50%,
        rgba(0, 0, 0, 0.2) 50%,
        rgba(0, 0, 0, 0.2)
      );
      background-size: 100% 4px;
      pointer-events: none;
      z-index: 10;
      opacity: 0.6;
    }
    
    // CRT Flicker/Glow (Optional but adds to effect)
    &::after {
        content: " ";
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: rgba(18, 16, 16, 0.1);
        opacity: 0;
        z-index: 10;
        pointer-events: none;
    }

    .title-area {
      height: 80px;
      display: flex;
      justify-content: left;
      padding: 0 20px;
      align-items: center;
      font-family: "像素", monospace; // Fallback to monospace
      color: #00ff00;
      border-bottom: #00ff00 1px solid;
      transition: 200ms;
      user-select: none;
      position: relative;
      z-index: 20;

      &:hover {
        filter: drop-shadow(0px 0px 5px #00ff00);
      }
    }

    .title-text {
      display: flex;
      flex-direction: column;
      gap: 5px;
      .main-title-text {
        font-size: 1.4rem;
        font-weight: bold;
      }
      .sub-title-text {
        font-size: 0.8rem;
        text-wrap: nowrap;
        color: #00aa00; // Dimmer green
      }
    }
  }

  .menu-content {
      padding: 20px;
      font-family: "像素", monospace;
      position: relative;
      z-index: 20;
      overflow-y: auto;
      height: calc(100% - 80px);
      
      /* Hide scrollbar for Chrome, Safari and Opera */
      &::-webkit-scrollbar {
        display: none;
      }
      /* Hide scrollbar for IE, Edge and Firefox */
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
  }

  .group-header {
      color: #005500; // Dark green
      font-size: 0.9rem;
      margin-top: 20px;
      margin-bottom: 10px;
      font-weight: bold;
  }

  .menu-item {
      display: flex;
      align-items: center;
      padding: 10px 0;
      color: #557799; // Grey/Blueish
      transition: all 0.2s;
      
      &:hover {
          color: #88aacc;
      }

      &.active {
          color: #00ff00;
          text-shadow: 0 0 5px #00ff00;

          .item-icon svg path {
              stroke: #00ff00;
              filter: drop-shadow(0 0 2px #00ff00);
          }
      }

      .item-icon {
          margin-right: 10px;
          display: flex;
          align-items: center;
          
          svg path {
             stroke: currentColor; 
          }
      }
      
      .item-text {
          flex: 1;
          font-size: 1rem;
      }
      
      .act-tag {
          font-size: 0.8rem;
          margin-left: 10px;
          opacity: 0.8;
      }
  }

  .alt-tip{
      font-size: 1rem;
      color: #00aa00;
  }
</style>
