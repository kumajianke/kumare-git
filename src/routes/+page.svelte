<script>
  // @ts-nocheck

  import { Canvas } from "@threlte/core";
  import Code3D from "../components/Code3D.svelte";
  import Computer3D from "../components/Computer3D.svelte";
  import Button from "../components/Button.svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import LoginCard from "../components/LoginCard.svelte";


  let login_mode = $state(false);
  let bgm_login = $state(null);

  let is_login = $state(false);

  onMount(() => {
    is_login = localStorage.getItem("msyt-token") !== null;
  });

  function play_bgm_login(){
    if(bgm_login){
        bgm_login.play();
    }
    bgm_login.playbackRate = "1.2"
  }


</script>
<audio src="/sound/sound.mp3" loop id="bgm-login" bind:this={bgm_login} ></audio>
<div class="title-area"> 
  <div class="title">库玛工作室</div>
  <div class="sub-title">码上云台</div>
  <div class="codes">
    <div class="comments">// Made By KuMare</div>
    <div class="code-line">System.ready();</div>
  </div>

  <div class="btn-group">
    <Button onClick={() => {}} style="border">关于我们</Button>
    {#if is_login}
      <Button
        onClick={() => {
          goto("/private");
        }}
        style="full">码上云台</Button
      >
    {:else}
      <Button onClick={() => {
        login_mode = true
      }} style="full">注册/登录</Button>
    {/if}
  </div>
</div>
{#if !login_mode}
  <div class="image">
    <Canvas>
      <Code3D />
    </Canvas>
  </div>
  <div></div>
{:else}
  <div class="image" on:mouseenter={
    ()=>{
        play_bgm_login();
    }
  }
  on:mouseleave={()=>{
    bgm_login.pause();
  }}
  >
    <Canvas>
      <Computer3D />
  </Canvas>
  </div>
{/if}

<style lang="less">
  .btn-group {
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: 30px;
  }

  .title-area {
    font-size: 6rem;
    font-family: "ali-shuhei";
    font-style: italic;
    position: relative;
    display: flex;
    gap: 20px;
    flex-direction: column;
    margin: 0 20px;

    .title {
      color: #3ae682;
    }
    .sub-title {
      color: white;
      font-size: 4rem;
    }
  }

  .image {
    border-radius: 20px;
    overflow: hidden;
    width: 1000px;
    height: 700px;
    position: relative;
  }

  .codes {
    margin: 20px;
    font-style: normal;
    font-family: "consolas";
    font-size: 1.4rem;
    .comments {
      color: #9398a6;
    }
    .code-line {
      color: #3ae682;
    }
  }

  
</style>
