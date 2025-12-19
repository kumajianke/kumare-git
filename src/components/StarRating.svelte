<script lang="ts">
  interface Props {
    value?: number;
    max?: number;
    readonly?: boolean;
    size?: number;
    onSelect?: (val: number) => void;
  }

  let {
    value = $bindable(0),
    max = 5,
    readonly = false,
    size = 24,
    onSelect,
  } = $props();

  let hoverValue = $state(0);
  let isHovering = $state(false);

  // Derived state to determine what to show (hover value or actual value)
  let displayValue = $derived(isHovering && !readonly ? hoverValue : value);

  function handleMouseMove(event: MouseEvent, index: number) {
    if (readonly) return;
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;

    // Determine if hovering over first half or second half
    const isHalf = x < width / 2;
    hoverValue = isHalf ? index - 0.5 : index;
  }

  function handleMouseLeave() {
    if (readonly) return;
    isHovering = false;
    hoverValue = 0;
  }

  function handleMouseEnter() {
    if (readonly) return;
    isHovering = true;
  }

  function handleClick() {
    if (readonly) return;
    value = hoverValue;
    if (onSelect) onSelect(value);
  }

  // Helper to determine star state: 'full', 'half', 'empty'
  function getStarState(index: number, currentVal: number) {
    if (currentVal >= index) return "full";
    if (currentVal >= index - 0.5) return "half";
    return "empty";
  }
</script>

<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<div 
  class="star-rating" 
  class:readonly 
  onmouseleave={handleMouseLeave}
  onmouseenter={handleMouseEnter}
>
  {#each Array(max) as _, i}
    {@const index = i + 1}
    {@const state = getStarState(index, displayValue)}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="star-wrapper"
      style:width="{size}px"
      style:height="{size}px"
      onmousemove={(e) => handleMouseMove(e, index)}
      onclick={handleClick}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="star-icon {state}"
      >
        <defs>
          <linearGradient id="half-gradient-{i}">
            <stop offset="50%" stop-color="currentColor" />
            <stop offset="50%" stop-color="transparent" />
          </linearGradient>
        </defs>
        
        <!-- Base empty star outline -->
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linejoin="round"
          class="star-outline"
        />
        
        <!-- Fill based on state -->
        {#if state === 'full'}
             <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="currentColor"
            />
        {:else if state === 'half'}
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="url(#half-gradient-{i})"
            />
        {/if}
      </svg>
    </div>
  {/each}
  <div class="rating-value">{displayValue.toFixed(1)}</div>
</div>

<style lang="less">
  .star-rating {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: "像素", monospace;
    user-select: none;
    
    &.readonly {
      opacity: 0.8;
      pointer-events: none;
    }
  }

  .star-wrapper {
    cursor: pointer;
    transition: transform 0.1s;
    position: relative;
    
    &:hover {
      transform: scale(1.1);
    }
  }

  .star-icon {
    color: #005500;
    transition: color 0.2s, filter 0.2s;
    
    &.full, &.half {
      color: #00ff00; 
      filter: drop-shadow(0 0 4px #00ff00);
    }
    
    .star-outline {
        stroke: #005500;
    }
  }
  
  .rating-value {
      margin-left: 10px;
      color: #00ff00;
      font-size: 1.2rem;
      min-width: 3ch;
  }
</style>
