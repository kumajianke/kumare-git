<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    onClick ?: any | null;
    children?: Snippet | null;
    style ?: string;
    size ?: string;
    onClickUp ?: any | null; // 点击释放事件
    width ?: string;
    
  }

  let { 
    children, 
    onClick=()=>{}, 
    style = "border", 
    size = "middle", 
    onClickUp=()=>{},
    width="fit-content"
} = $props();

let cumstor_width = $derived.by(()=>{
    return width !== "fit-content"
})


</script>

<div style:width="{width}" class="btn-content {style} {size} {cumstor_width ? 'cumstor-width' : ''}" onclick={(e: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) => onClick?.(e)} onmouseup={(e: MouseEvent & { currentTarget: EventTarget & HTMLDivElement }) => onClickUp?.(e)}>
  {@render children()}
</div>

<style lang="less">
  .btn-content {
    user-select: none;
    font-size: 20px;
    width: fit-content;
    cursor: pointer;
    border-radius: 8px;
    text-wrap: nowrap;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    box-sizing: border-box;

    // Style: Border
    &.border {
      border: 1px solid #3ae682;
      background: transparent;
      color: #3ae682;

      &:hover {
        background: #22ECDB;
        color: #1c2628;
        box-shadow: 0 0 25px rgba(58, 230, 130, 0.6);
        transform: translateY(-2px);
      }
    }

    // Style: Full
    &.full {
      border: 1px solid #3ae682;
      background: #3ae682;
      color: #1c2628;

      &:hover {
        background: rgba(58, 230, 130, 0.1);
        color: #3ae682;
        box-shadow: 0 0 20px rgba(58, 230, 130, 0.4) inset, 0 0 10px rgba(58, 230, 130, 0.4);
        transform: translateY(-2px);
      }
    }

    &.no-border{
        .border;    
        border: none;

        &:hover{
            background: transparent;
            color: white;
        }
    }

    &.middle {
      padding: 12px 30px;
    }

    &.cumstor-width {
        width: 100%;
        text-align: center;
    }
    
    &:active {
      transform: scale(0.98) translateY(0);
    }
  }
</style>
