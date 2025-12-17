<script>
// @ts-ignore

  import Input from "../Input.svelte";
  import Selector from "../Selector.svelte";

  let task_req = $state({
    task_title: "",
  });
</script>

<div class="form-task-create">
  <div class="group">
    <div class="label">* 任务名称</div>
    <Input width={"100%"} bind:value={task_req.task_title} auto_foucs />
  </div>

  <div class="group">
    <div class="label">* 所属项目</div>
    <Selector width="100%" items={["Hello", "World"]} />
  </div>

</div>

<style lang="less">
    .group {
        display: flex;
        flex-direction: column;
        gap: 20px;
        .label {
            font-size: 1.3rem;
            color: rgb( 58,228,129);
            font-weight: bold;
            font-family: "像素";
            
        }
    }
</style>
