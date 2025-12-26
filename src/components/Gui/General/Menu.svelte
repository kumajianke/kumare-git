<script lang="ts">
  import { flip } from "svelte/animate";

  interface Item {
    id: number; // Add unique ID for flip animation
    title: string;
    date: string;
    icon: string;
    detail?: string;
    onClick: () => boolean;
  }

  interface Props {
    items: Item[];
  }

  let {
    items = [
      {
        id: 1,
        title: "1 6ugo-圈子系统部分",
        date: "2023-01-02",
        icon: "/image/kuma.png",
        detail: "这是一个详细描述",
        onClick: () => true,
      },
      {
        id: 2,
        title: "2 6ugo-圈子系统部分",
        date: "2023-01-02",
        icon: "/image/kuma.png",
        detail: "这是一个详细描述",
        onClick: () => true,
      },
      {
        id: 3,
        title: "3 6ugo-圈子系统部分",
        date: "2023-01-02",
        icon: "/image/kuma.png",
        detail: "这是一个详细描述",
        onClick: () => true,
      },
      {
        id: 4,
        title: "4 6ugo-圈子系统部分",
        date: "2023-01-02",
        icon: "/image/kuma.png",
        detail: "这是一个详细描述",
        onClick: () => true,
      },
      {
        id: 5,
        title: "5 6ugo-圈子系统部分",
        date: "2023-01-02",
        icon: "/image/kuma.png",
        detail: "这是一个详细描述",
        onClick: () => true,
      },
    ],
  } = $props();

  let itemsContentRef: HTMLDivElement | undefined = $state();
  let selectedIndex = $state(-1);

  let isDown = false;
  let isDragging = false; // 判断是否出现点击事件
  let startX = 0;
  let initialScrollLeft = 0;

  function modifySelectedIndex(index: number) {
    if (isDragging) return; // 取消拖动时候偶尔会触发点击的事件

    let new_array = [items[index]];
    selectedIndex = index;

    items.forEach((item, idx) => {
      if (idx === selectedIndex) return;
      new_array.push(item);
    });

    items = new_array; // 更新数组
    console.log(items);

    selectedIndex = 0;

    // 滚动到最左侧
    if (itemsContentRef) {
      setTimeout(() => {
        itemsContentRef?.scrollTo({
          left: -1000,
          behavior: "smooth",
        });
      }, 740);
    }
  }

  //#region 拖动Items部分的代码
  function onWheel(e: WheelEvent) {
    if (!itemsContentRef) return;
    e.preventDefault();
    itemsContentRef.scrollLeft += e.deltaY;
  }

  function onMouseDown(e: MouseEvent) {
    isDown = true;
    isDragging = false; // Reset drag flag
    if (itemsContentRef) {
      // Record initial mouse position and scroll position
      startX = e.pageX;
      initialScrollLeft = itemsContentRef.scrollLeft;
    }
  }

  function onMouseLeave() {
    isDown = false;
  }

  function onMouseUp() {
    isDown = false;
    // We delay resetting isDragging slightly to ensure click handler can check it
    setTimeout(() => {
      isDragging = false;
    }, 0);
  }

  function onMouseMove(e: MouseEvent) {
    if (!isDown || !itemsContentRef) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier

    // If moved more than a small threshold, consider it a drag
    if (Math.abs(walk) > 5) {
      isDragging = true;
    }

    itemsContentRef.scrollLeft = initialScrollLeft - walk;
  }
  //#endregion
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="items-content"
  bind:this={itemsContentRef}
  on:wheel={onWheel}
  on:mousedown={onMouseDown}
  on:mouseleave={onMouseLeave}
  on:mouseup={onMouseUp}
  on:mousemove={onMouseMove}
  on:click|stopPropagation={() => {}}
  role="region"
  aria-label="Scrollable content"
>
  {#each items as item, index (item.id)}
    <div
      class="item"
      animate:flip={{ duration: 700 }}
      class:active={index === selectedIndex}
      on:click|stopPropagation={() => {
        modifySelectedIndex(index);
      }}
    >
      <div class="top">
        <img src={item.icon} class="image-content" />
        <div class="title-detail">
          <div class="title">{item.title}</div>
          {#if item.detail}
            <div class="detail">{item.detail}</div>
          {/if}
        </div>
      </div>
    </div>
  {/each}
</div>

<style lang="less">
  .items-content {
    user-select: none;
    display: flex;

    width: 100%;
    overflow: hidden;
    cursor: grab;
    z-index: 1;
    transition: 300ms;

    .active {
      transform: scale(1.2);
      filter: drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.5));
      position: relative;
      left: 40px;
      z-index: 2;
      margin-right: 100px;
    }

    /* Hide scrollbar */
    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .item {
    padding: 20px 10px;
    // border: 3px solid #009900;
    box-sizing: border-box;
    max-width: 370px;
    max-height: 200px;
    flex-direction: column;
    display: flex;
    gap: 30px;
    transition: 300ms;

    &:hover {
      filter: drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.5));
      background-color: #00990022;
    }
    .top {
      display: flex;
      gap: 30px;
      align-items: center;

      .title {
        font-size: 20px;
        font-weight: bold;
        text-wrap: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: white;
      }
    }
  }
  .image-content {
    pointer-events: none;
    content: "";
    width: 100px;
    height: 100px;
    user-select: none;
    border-radius: 50%;
  }
  .title-detail {
    display: flex;
    color: white;
    flex-direction: column;
    gap: 10px;
  }

  .detail {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    font-size: 0.87rem;
    color: rgb(147, 144, 149);
    -webkit-line-clamp: 2;
    max-height: 50px;
    // background-color: aqua;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
