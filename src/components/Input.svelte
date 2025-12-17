<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    input_type?: string;
    width?: number | string;
    placeholder?: string;
    value: string;
    auto_foucs ?: boolean;
  }

  let { value= $bindable(""), input_type = "text", width = "200px" ,placeholder="", auto_foucs=false} = $props();

  let input_element : undefined | HTMLInputElement = $state();

  onMount(()=>{
    if(auto_foucs){
      let count = 0;
      setInterval(()=>{
        if(count < 100){
          count++;
          if(input_element) input_element.focus();
        }
      }, 10)
    }
  })
</script>

<input type={input_type} bind:value={value} style:width="{typeof width === 'number' ? width + 'px' : width}" class="input-self" {placeholder} bind:this={input_element}/>

<style lang="less">
  .input-self {
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
    
    transition: all 200ms;

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