<script lang="ts">
  import { getExecuteCommand } from "$lib/command";
  import ConsoleInput from "./ConsoleChildren/ConsoleInput.svelte";
  import Modal from "./Modal.svelte";
  import { activeWorkspace } from "$lib/bus";
  import PassModal from "./PassModal.svelte";
  import type {  Component } from "svelte";
  import type { CommandResult } from "$lib/int/CommandResult";

  let command_input = $state("");
  let isDisActive = $derived($activeWorkspace !== 'console');

  let modal_component : Component = $state(PassModal);
  let modal_title : string = $state("")
  let modal_ctrl : boolean = $state(false);  
  let command_history_text: string[] = $state([]);
  let command_line_element: HTMLElement | undefined = $state();

  /**
   * 渲染Command对象返回的 CommandResult
   * @param command_result
   */
  function handler_command_result(command_result: CommandResult) {
    let { modify, error } = command_result;

    if (error) {
      command_history_text.push("err:" + error.error_message);
    } else {
      command_history_text.push(command_input);
    }

    // 修正 command_history_text
    if (modify) {
      let mod_cht = modify.command_history_text;
      mod_cht = mod_cht !== void 0 ? mod_cht : command_history_text;
      command_history_text = mod_cht;
    }
    
    // 展示组件
    if(modify.components){
      let {show_component, show_way} = modify.components;
      if(show_way==="modal"){
        modal_component = show_component;
        activeWorkspace.set("modal")
        modal_ctrl = true;
        modal_title = modify.components.modal_title || "";
      }
    }
  }
  
  /**
   * 回车执行函数 获取对应的Handler信息
   * @param e
   */
  //@ts-ignore
  async function handleEnter(e) {
    console.log(command_line_element);

    if (command_line_element) {
      command_line_element.scrollTop = 10000000000000;
    }
    if (e.key === "Enter") {
      let ctx = {
        command_history_text,
        command_input,
      };

      if (command_input === "") {
        command_history_text.push("Command-line >");
        return;
      }

      let wrapper_func = await getExecuteCommand(command_input);
      let command_result = wrapper_func(ctx);

      handler_command_result(command_result);
      command_input = "";
    }
    
  }

  $effect(()=>{
    if(modal_ctrl === false){
      activeWorkspace.set("console")
    }
  })
</script>

<Modal bind:show={modal_ctrl} title={modal_title} width="500px">
  <svelte:component this={modal_component} />
</Modal>
<div class="console-content" bind:this={command_line_element}>
  <div class="command-lins-history">
    <pre class="acsii-art">
                                                                   ▄▄       
▄▄                                                       ██       
██ ▄█▀ ██ ██ ███▄███▄  ▀▀█▄ ████▄ ▄█▀█▄   ▄████ ▄███▄ ▄████ ▄█▀█▄ 
████   ██ ██ ██ ██ ██ ▄█▀██ ██ ▀▀ ██▄█▀   ██    ██ ██ ██ ██ ██▄█▀ 
██ ▀█▄ ▀██▀█ ██ ██ ██ ▀█▄██ ██    ▀█▄▄▄   ▀████ ▀███▀ ▀████ ▀█▄▄▄ 
    </pre>

    {#if command_history_text.length > 0}
      <!-- <p>CommandHistory:</p> -->
      {#each command_history_text as item}
        <div class="command-line">{item}</div>
      {/each}
    {/if}
  </div>
  <ConsoleInput on_keydown={handleEnter} bind:inputValue={command_input} bind:disabled={isDisActive} />
</div>

<style lang="less">
  .acsii-art {
    font-size: 1rem;
    font-family: "Courier New", Courier, monospace;
    color: #3ae481;
    filter: drop-shadow(0 0 5px #3ae481);
  }

  .console-content {
    
    color: white;
    font-size: 2rem;
    font-family: "像素" !important;
    padding: 1rem;
    padding-bottom: 200px;
    height: 100vh;
    box-sizing: border-box;
    overflow: auto;

    &::-webkit-scrollbar {
      width: 16px; 
    }

    &::-webkit-scrollbar-track {
      background: #001100; 
      border-left: 2px solid #003300;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #00ff00;
      border: 2px solid #001100;
      box-shadow: 0 0 5px #00ff00;
      min-height: 20px;
      
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: #33ff33; /* Brighter on hover */
      box-shadow: 0 0 10px #33ff33;
    }
    
    /* For Firefox */
    scrollbar-width: thin;
    scrollbar-color: #00ff00 #001100;
  }
</style>
