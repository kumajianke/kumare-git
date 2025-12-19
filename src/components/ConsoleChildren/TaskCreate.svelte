<script>
  // @ts-nocheck

  // @ts-ignore
  import Button from "../Button.svelte";

  import Input from "../Input.svelte";
  import Selector from "../Selector.svelte";
  import StarRating from "../StarRating.svelte";
  import Tags from "../Tags.svelte";

  let task_req = $state({
    task_title: "",
    difficulty: 0,
  });

  let tags = $state([]);
</script>

<div class="form-task-create">
  <div class="left task-items">
    <div class="group">
      <div class="label">* 任务名称</div>
      <Input width={"100%"} bind:value={task_req.task_title} auto_foucs />
    </div>

    <div class="group">
      <div class="label">* 所属项目</div>
      <Selector width="100%" items={["Hello", "World"]} />
    </div>

    <div class="group">
      <div class="label">* 标签</div>
      <Tags width="100%" items={tags} />
    </div>

    <div class="group">
      <div class="label">* 重要程度</div>
      <StarRating size={35} bind:value={task_req.difficulty} />
    </div>
  </div>
  <div class="right task-items">
    <div class="group">
      <div class="label">* 流程类型</div>
      <Selector
        width="100%"
        items={[
          "一般任务开发流程",
          "教学任务开发流程",
          "课堂作业开发流程",
          "创建一个新的流程...",
        ]}
      />
    </div>

    <div class="group">
      <div class="label">* 任务描述</div>
      <Input width={"100%"} bind:value={task_req.task_title} auto_foucs />
    </div>
  </div>
</div>
<br />

<div class="content-btn">
  <Button onClickUp={() => {}} width="100%">保存草稿(仅本地) [ctrl + s]</Button>
  <Button onClickUp={() => {}} width="100%" style="full">创建任务 [ctrl + enter]</Button>
</div>

<style lang="less">

  .content-btn{
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .group {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 400px;
    .label {
      font-size: 1.3rem;
      color: rgb(58, 228, 129);
      font-weight: bold;
      font-family: "像素";
    }
  }
  .task-items {
    display: flex;
    gap: 22px;
    flex-direction: column;
  }
  .form-task-create {
    display: flex;
    flex-direction: row;
    gap: 20px;
  }
</style>
