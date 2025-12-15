<script>
  import Input from "../Input.svelte";
  
  let task_req = $state({
    task_title: ""
  });

  

</script>

<div class="form-task-create">
  <div class="label">* 任务名称</div>
  <Input width={300} bind:value={task_req.task_title}></Input>
  
</div>
