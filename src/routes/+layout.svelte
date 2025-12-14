<script lang="ts">
</script>

<div class="page-content">
  <slot />
</div>

<style lang="less">
  @font-face {
    font-family: "ali-shuhei";
    src: url("/fonts/ali-shuhei.ttf");
  }

  @font-face{
    font-family: "像素";
    src: url("/fonts/FZG_CN.ttf");
  }
  .page-content {
    z-index: 1;
    height: 100vh;  
    width: 100vw;
    display: flex;
    justify-content: space-around;
    align-items: center;
    box-sizing: border-box;
    background-color: #111110;
    background-image: linear-gradient(
        rgba(255, 255, 255, 0.08) 1px,
        transparent 1px
      ),
      linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
    background-size: 40px 40px;
    position: relative;
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      opacity: 0.05;
    }
  }
</style>
