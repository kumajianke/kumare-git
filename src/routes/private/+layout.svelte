<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import Side from "../../components/Side.svelte";
  import { activeWorkspace } from "$lib/bus";

  onMount(() => {
    let local_token = localStorage.getItem("msyt-token");
    if (!local_token) {
      goto("/");
    }

    const handleGlobalKeydown = (event: KeyboardEvent) => {
      if (event.altKey && event.code === "KeyR") {
        event.preventDefault();
        activeWorkspace.set("side");
      } else if (event.altKey && event.code === "KeyC") {
        event.preventDefault();
        activeWorkspace.set("console");
      }
    };

    window.addEventListener("keydown", handleGlobalKeydown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeydown);
    };
  });
</script>

<Side
  title="云上码台"
  title_icon="/image/kuma.png"
  subtitle="// version α0.0.1"
  width="223px"
  items={[
    
    {
      title: "我的任务",
      group: "task",
    },
    {
      title: "里程碑",
      group: "task",
    },
    {
      title: "任务分派",
      group: "task",
    },
    {
      title: "今日待办",
      group: "task",
    },
    {
      title: "项目管理",
      group: "project",
    },
    {
      title: "新目立项",
      group: "project",
    },
    {
      title: "搜索工作小组",
      group: "group",
    },
    {
      title: "创建工作小组",
      group: "group",
    },
    {
      title: "切换工作小组",
      group: "group",
    },
    {
      title: "设置",
      group: "setting",
    },
  ]}
/>

<div class="page-content">
  <slot></slot>
</div>

<style lang="less">
  .page-content {
    cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewport='0 0 10 10' style='fill:rgb( 159, 255, 199);font-size:10px;'><circle cx='5' cy='5' r='3'/></svg>") 5 5, auto !important;
    position: absolute;
    top: 0;
    left: 223px;
    right: 0;
    bottom: 0;
    box-sizing: border-box;
    overflow: hidden;
    z-index: 100;
  }
</style>
