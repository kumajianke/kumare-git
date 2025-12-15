<script lang="ts">
  import { T } from "@threlte/core";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
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

  function onchange_ctrl(e: any) {
    let ctrl = e.target;
    let camera = ctrl.object;
    console.log(camera.position);
  }
  let Computer3D: OrbitControls | undefined = $state();

  const great_position = $state([0.84, -1.01, 18.86]);

  let showLockConfirm = $state(false);
  let isLocked = $state(false);

  async function goGreatPosition() {
    if (Computer3D) {
      //@ts-ignore
      const camera = Computer3D.object;
      const t = tweened(
        [camera.position.x, camera.position.y, camera.position.z],
        {
          duration: 500,
          easing: cubicOut,
        }
      );

      const unsub = t.subscribe((p) => {
        goPoint(p);
      });

      await t.set(great_position);
      unsub();
      showLockConfirm = true;
    }
  }

  function lockView() {
    isLocked = true;
    showLockConfirm = false;
    // Disable controls
    if (Computer3D) {
      // @ts-ignore
      Computer3D.enableRotate = false;
      // @ts-ignore
      Computer3D.enableZoom = false;
    }
  }

  function cancelLock() {
    showLockConfirm = false;
  }

  //@ts-ignore
  function goPoint(pos) {
    if (Computer3D) {
      // 1. 获取被控制的相机 (通常是 default camera)
      //@ts-ignore
      const camera = Computer3D.object;
      camera.position.set(...pos);
      //@ts-ignore
      Computer3D.update();
    }
  }
</script>

<div class="content-computer-3d">
  <T.AmbientLight intensity={3} />
  <T.DirectionalLight position={[5, 5, 10]} intensity={10} />
  <T.DirectionalLight position={[-5, 5, 10]} intensity={1} />

  <T.PerspectiveCamera makeDefault position={[0, 0, 30]}>
    <OrbitControls
      enableZoom={true}
      enablePan={false}
      onchange={onchange_ctrl}
      bind:ref={Computer3D}
    />
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
        <T.MeshStandardMaterial
          color="#333333"
          roughness={0.5}
          metalness={0.8}
        />
      </T.Mesh>

      <!-- Screen Area -->
      <T.Mesh position.z={screenDepth / 2 + 1.01} position.y={0}>
        <T.PlaneGeometry args={[screenWidth, screenHeight]} />
        <T.MeshBasicMaterial color="#000000" />

        <!-- HTML Content on Screen -->
        <HTML transform position.z={0.01} occlude="blending">
          <div class="screen-content">
            <!-- CRT Overlay -->
            <div class="crt-overlay"></div>

            {#if showLockConfirm}
              <div class="modal-overlay">
                <div class="modal-box">
                  <div class="lock-title">是否锁定视角？</div>
                  <div class="lock-buttons">
                    <div on:mousedown={lockView} class="lock-btn confirm">
                      是
                    </div>
                    <div on:mousedown={cancelLock} class="lock-btn cancel">
                      否
                    </div>
                  </div>
                </div>
              </div>
            {/if}

            <div class="content-wrapper">
              {#if currentView === "menu"}
                <div class="menu-view">
                  <div class="menu-title">
                    > Hacklo World
                    <div class="blink">_</div>
                  </div>
                  <div class="menu-buttons">
                    <div on:mousedown={goLogin}>
                      <Button onClick={goLogin} style="full">定向入侵</Button>
                    </div>
                    <div on:mousedown={goReg}>
                      <Button onClick={goReg} style="border">SQL 注入</Button>
                    </div>
                    <div
                      class="tips"
                      on:mousedown={() => {
                        goGreatPosition();
                      }}
                    >
                      command-line > 点击此处进入【沉浸模式】 <span class="fast-blink">_</span>
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
</div>

<style>
  .screen-content {
    user-select: none;
    width: 990px;
    height: 700px;
    background-color: #000000;
    color: #3ae682;
    font-family: "像素", monospace;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid #333;
    left: 10px;
    top: -10px;
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

  .blink {
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

  .fast-blink {
    animation: blink 1500ms steps(1) infinite;
  }

  .tips {
    position: absolute;
    bottom: 50px;
    right: 50px;
    cursor: pointer;

    &:hover {
      color: #fff;
    }
  }

  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }

  .modal-box {
    background: #010104;
    border: 2px solid #3ae682;
    padding: 30px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 0 20px rgba(58, 230, 130, 0.3);
  }

  .lock-title {
    color: #3ae682;
    font-size: 1.5rem;
    margin-bottom: 20px;
  }

  .lock-buttons {
    display: flex;
    gap: 20px;
    justify-content: center;
  }

  .lock-btn {
    padding: 8px 25px;
    cursor: pointer;
    border: 1px solid #3ae682;
    color: #3ae682;
    transition: all 0.3s;
  }

  .lock-btn:hover {
    background: #3ae682;
    color: #010104;
  }

  .content-computer-3d {
    user-select: none;
  }
</style>
