<script lang="ts">
  import { Canvas, T } from "@threlte/core";
  // 1. 引入这个新工具
  import { OrbitControls } from "@threlte/extras";
</script>

<Canvas>
  <T.PerspectiveCamera makeDefault position={[1,1,1]}>
    <OrbitControls />
  </T.PerspectiveCamera>

  <T.Mesh>
    <T.BoxGeometry />
    <T.MeshMatcapMaterial color="red" />
  </T.Mesh>
</Canvas>