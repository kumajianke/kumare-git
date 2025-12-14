<script lang="ts">
  import { Canvas, T } from "@threlte/core";
  import { OrbitControls, useHelper } from "@threlte/extras";
  // 1. 引入 Three.js 原生的辅助器类
  import { DirectionalLightHelper, DirectionalLight } from "three";

  // 摄像机状态
  let position_camera = $state([0, 0, 5]);
  let camera = $state();

  // 2. 定义灯光的状态变量
  // 注意：light 最开始是 undefined，等渲染好后才有值
  let light: DirectionalLight | undefined = $state(undefined);

  // 3. 使用辅助器钩子
  // 第一个参数：一个返回 light 实例的函数（因为 light 一开始是空的）
  // 第二个参数：辅助器类名 (DirectionalLightHelper)
  // 第三个参数：辅助器的大小 (这里设为 1)
  useHelper(() => light, DirectionalLightHelper, 1);

  // 4. 定义光源位置，方便我们同时控制“灯”和“小球”
  let lightPos = [5, 5, 5];
</script>

<Canvas>
  <T.PerspectiveCamera makeDefault position={position_camera} bind:ref={camera}>
    <OrbitControls enablePan={false} />
  </T.PerspectiveCamera>

  <T.DirectionalLight 
    position={lightPos} 
    intensity={1.5} 
    bind:ref={light}
  />

  <T.Mesh position={lightPos}>
    <T.SphereGeometry args={[0.5]} />
    <T.MeshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={2} />
  </T.Mesh>


  <T.AmbientLight intensity={0.5} />
  
  <T.Mesh rotation={[1, 1, 1]}>
    <T.BoxGeometry />
    <T.MeshStandardMaterial color="#ff3e00" />
  </T.Mesh>

  <T.GridHelper args={[10, 10]} />
</Canvas>