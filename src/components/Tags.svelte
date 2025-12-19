<script lang="ts">
  interface Props {
    width: string;
    items: string[];
  }
  let input_value = $state("");

  let { width, items = $bindable([]) } = $props();

  function add_tags(e: KeyboardEvent) {
    if (e.key === "Enter") {
      if (input_value) {
        items.push(input_value);
        input_value = "";
      }
    }
  }
</script>

<div class="tags-input-content">
  <div class="tags-contant">
    {#key items}
      {#each items as item, index}
        <div
          class="tag-item"
          on:click={() => {
            items.splice(index, 1);
          }}
        >
          {item}
        </div>
      {/each}
    {/key}
  </div>

  <input
    bind:value={input_value}
    type="text"
    placeholder="回车添加标签"
    class="task-input"
    style:width
    on:keydown={add_tags}
  />
</div>

<style lang="less">
  .tags-contant {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 0 0 10px 0;
    max-width:50% ;
  }

  .tag-item {
    background-color: #3ae682;
    color: white;
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 1.23rem;
    font-family: "像素";
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .task-input {
    background-color: transparent;
    outline: none;
    border: white 1px solid;
    padding: 10px 20px;
    color: white;
    font-size: 1.23rem;
    font-family: "像素";
    box-sizing: border-box;
    border-radius: 8px;
    transition: 200ms;
    &:focus {
      transform: translateY(-2px);
      color: #3ae682;
      border: #3ae682 1px solid;
    }
  }
</style>
