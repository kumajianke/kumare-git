<script lang="ts">
  import { T } from '@threlte/core'
  import { useTexture, RoundedBoxGeometry, OrbitControls, Float } from '@threlte/extras'

  // 1. 加载你的图片 (确保路径正确，比如放在 static 目录下)
  const texture = useTexture('/image/codes.png')

  // 设定名牌尺寸比例 (817 x 217)
  const cardWidth = 81.17
  const cardHeight = 51.7
  const cardDepth = 0.5

  const fixTexture = (map: any) => {
    if (!map || !map.image) return
    const image = map.image
    const planeWidth = cardWidth - 0.2
    const planeHeight = cardHeight - 0.2
    const planeAspect = planeWidth / planeHeight
    const imageAspect = image.width / image.height
    
    // Calculate aspect ratio difference
    const aspect = planeAspect / imageAspect
    
    // Reset matrix
    map.matrixAutoUpdate = true
    

    
    // map.needsUpdate = true
  }
</script>

<T.AmbientLight intensity={1} />
<T.DirectionalLight position={[5, 5, 10]} intensity={2} />
<T.DirectionalLight position={[-5, 5, 10]} intensity={1} />

<T.PerspectiveCamera makeDefault position={[0, 0, 60]}>
  <OrbitControls enableZoom={true} />
</T.PerspectiveCamera>

<Float
  floatIntensity={1}
  rotationIntensity={0.5}
  speed={1}
>
  <T.Group> 
    <T.Mesh>
      <RoundedBoxGeometry args={[cardWidth, cardHeight, cardDepth]} radius={0.1} smoothness={4} />
      <!-- 镭射高亮材质 -->
      <T.MeshPhysicalMaterial 
        color="#3AE682" 
        roughness={0.2} 
        metalness={0.8}
        iridescence={1}
        iridescenceIOR={1.6}
        iridescenceThicknessRange={[100, 400]}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </T.Mesh>

    {#await texture then map}
      <T.Mesh position.z={cardDepth / 2 + 0.05}> 
        <T.PlaneGeometry args={[cardWidth - 0.2, cardHeight - 0.2]} />
        <T.MeshBasicMaterial {map} transparent opacity={0.9} />
        { (() => { fixTexture(map); return ''; })() }
      </T.Mesh>
    {/await}
  </T.Group>
</Float>