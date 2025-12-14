<script lang="ts">
  import { T } from "@threlte/core";
  import {
    HTML,
    Float,
    OrbitControls,
    RoundedBoxGeometry,
  } from "@threlte/extras";
  import LoginCard from "./LoginCard.svelte";
  import RegCard from "./RegCard.svelte";
  import Button from "./Button.svelte";

  let currentView = $state("menu"); // 'menu', 'login', 'register'

  function goLogin() {
    currentView = "login";
  }

  function goReg() {
    currentView = "register";
  }

  function goBack() {
    currentView = "menu";
  }

  // Computer screen dimensions
  const screenWidth = 24.4;
  const screenHeight = 18.5;
  const screenDepth = 1;
</script>

<T.AmbientLight intensity={3} />
<T.DirectionalLight position={[5, 5, 10]} intensity={10} />
<T.DirectionalLight position={[-5, 5, 10]} intensity={1} />

<T.PerspectiveCamera makeDefault position={[0, 0, 30]}>
  <OrbitControls enableZoom={true} />
</T.PerspectiveCamera>

<Float floatIntensity={0.5} rotationIntensity={0.2} speed={1}>
  <T.Group>
    <!-- Computer Body/Monitor Frame -->
    <T.Mesh>
      <RoundedBoxGeometry
        args={[screenWidth + 1, screenHeight + 1, screenDepth + 2]}
        radius={0.5}
        smoothness={10}
      />
      <T.MeshStandardMaterial color="#333333" roughness={0.5} metalness={0.8} />
    </T.Mesh>

    <!-- Screen Area -->
    <T.Mesh position.z={screenDepth / 2 + 1.01} >
      <T.PlaneGeometry args={[screenWidth, screenHeight ]} />
      <T.MeshBasicMaterial color="#000000" />

      <!-- HTML Content on Screen -->
      <HTML transform position.z={0.01}  occlude="blending" >
        <div class="screen-content">
          <!-- CRT Overlay -->
          <div class="crt-overlay"></div>

          <div class="content-wrapper" >
            {#if currentView === "menu"}
              <div class="menu-view">
                <div class="menu-title">
                  > 
                  Hello, World 
                  <div class='blink'> _ </div>
                </div>
                <div class="menu-buttons">
                  <div on:mousedown={goLogin}>
                    <Button onClick={goLogin} style="full">登 录</Button>
                  </div>
                  <div on:mousedown={goReg}>
                    <Button onClick={goReg} style="border">注 册</Button>
                  </div>
                </div>
              </div>
            {:else if currentView === "login"}
              <div class="card-view">
                <div class="back-btn" on:mousedown={goBack}>
                  <Button size="small" style="no-border">{"< 返回"}</Button>
                </div>
                <LoginCard />
              </div>
            {:else if currentView === "register"}
              <div class="card-view">
                <div class="back-btn" on:mousedown={goBack}>
                  <Button size="small" style="no-border">{"< 返回"}</Button>
                </div>
                <RegCard />
              </div>
            {/if}
          </div>
        </div>
      </HTML>
    </T.Mesh>
  </T.Group>
</Float>

<style>
  .screen-content {
    width: 800px;
    height: 600px;
    background-color: #000000;
    color: #3ae682;
    font-family: "像素", monospace;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid #333;
    top: -40px;
    border: none;
  }

  .crt-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      rgba(18, 16, 16, 0) 50%,
      rgba(0, 0, 0, 0.25) 50%
    );
    background-size: 100% 4px;
    pointer-events: none;
    z-index: 10;
    opacity: 0.6;
    animation: scanline 10s linear infinite;
  }

  .crt-overlay::before {
    content: " ";
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(
        rgba(18, 16, 16, 0) 50%,
        rgba(0, 0, 0, 0.25) 50%
      ),
      linear-gradient(
        90deg,
        rgba(255, 0, 0, 0.06),
        rgba(0, 255, 0, 0.02),
        rgba(0, 0, 255, 0.06)
      );
    z-index: 2;
    background-size:
      100% 2px,
      3px 100%;
    pointer-events: none;
  }

  .content-wrapper {
    position: relative;
    z-index: 5;
    width: 100%;
    height: 100%;
    /* background: #000000; */
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .menu-view {
    display: flex;
    flex-direction: column;
    gap: 40px;
    align-items: center;
  }

  .menu-title {
    user-select: none;
    font-size: 3rem;
    font-family: "像素", monospace;
    font-weight: bold;
    text-shadow: 0 0 10px #3ae682;
    margin-bottom: 20px;
  }

  .menu-buttons {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .card-view {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .back-btn {
    position: absolute;
    top: 20px;
    left: 20px;
  }

  .blink{
    display: inline-block;
    animation: blink 2s steps(1) infinite;
  }

  @keyframes blink {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes scanline {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 0 100%;
    }
  }
</style>
