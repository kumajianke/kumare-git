<script>
// @ts-nocheck


  import { Canvas, T } from "@threlte/core";
  import { OrbitControls } from "@threlte/extras";

  let light_p = [0,1,1]
</script>

<Canvas>

  <T.PerspectiveCamera makeDefault position={[0,0,2]}>
    <OrbitControls />
  </T.PerspectiveCamera>

  <T.PointLight position={light_p} />
  
  <!-- 光源 -->
  <T.Mesh position={light_p} >
    <T.BoxGeometry/>
    <T.MeshStandardMaterial color="light"/>
  </T.Mesh>

  <T.Mesh>
    <T.BoxGeometry />
    <T.MeshStandardMaterial color="red"/>
  </T.Mesh>
</Canvas>