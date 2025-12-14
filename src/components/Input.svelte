<script lang="ts">
  interface Props {
    input_type?: string;
    width?: number;
    placeholder?: string
  }
  let { input_type = "text", width = 200 ,placeholder=""} = $props();
</script>

<input type={input_type} style:width="{width}px" class="input-self" {placeholder}/>

<style lang="less">
  .input-self {
    // 基础样式
    user-select: none;
    height: 1rem;
    margin-bottom: 2rem;
    padding: 25px 16px;
    box-sizing: border-box;
    border: 1px solid white;
    border-radius: 0.5rem;
    background-color: transparent !important;
    font-size: 1.3rem;
    outline: none;
    font-family: "像素";
    position: relative;
    top: 0;
    color: white;
    
    // 普通状态下的过渡效果 (top, border, color 等)
    transition: all 200ms;

    // --- 核心修复代码开始 ---
    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
      transition: background-color 99999s ease-in-out 0s;
      
      -webkit-text-fill-color: white !important;
    }
    &:focus {
      top: -4px;
      color: #3AE682;
      border: 1px solid #3AE682;

      &:-webkit-autofill {
        -webkit-text-fill-color: #3AE682 !important;
      }
    }
  }
</style>