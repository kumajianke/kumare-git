<script lang="ts">
  import Button from "./Button.svelte";
  import Input from "./Input.svelte";
  let mode = $state({
    password: "USERNAME",
    email: "EMAIL",
  });

  let active_mode: string = $state(mode.password);

  function change_active(mode_name?: string | null) {
    if (mode_name) {
      active_mode = mode_name;
      return;
    } else {
      if (active_mode === mode.password) {
        active_mode = mode.email;
      } else {
        active_mode = mode.password;
      }
    }
  }
</script>

<div class="login-content">
  <div class="login-title">
    <div>Validate Terminal</div>

    <span class="sub-title">Login By {active_mode}</span>
  </div>

  <div class="login-form">
    {#if active_mode === mode.password}
      <Input width={500} placeholder="远程木马名称" />
      <Input width={500} input_type="password" placeholder="RSA文件密钥" />
      <div
        on:mousedown={() => {
          console.log("你好");
        }}
      >
        <Button width={"500px"} style="full">远程木马提权</Button>
      </div>
    {:else if active_mode === mode.email}
      <div class="input-with-btn">
        <Input width={500} placeholder="回传终端数据到指定邮箱..." />
        <div on:mousedown={() => {}}>
          <Button >回传终端验证</Button>
        </div>
      </div>
      <div
        on:mousedown={() => {
          console.log("你好");
        }}
      >
        <Button width={"500px"} style="full">下载终端验证</Button>
      </div>
    {/if}

    <div
      on:mousedown={() => {
        change_active();
      }}
    >
      <Button width={"500px"} style="border">切换验证终端</Button>
    </div>
  </div>
</div>

<style lang="less">
  .login-content {
    user-select: none;
    width: 50%;
    color: #3ae682;
    font-size: 2.3rem;
    font-family: "ali-shuhei";
    text-align: left;
  }
  .login-title {
    font-family: "像素";
    .sub-title {
      font-size: 1.3rem !important;
      color: white;
    }
  }
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 40px;
    margin: 60px 0;
  }
  .input-with-btn {
    display: flex;
    text-wrap: nowrap;
    gap: 20px;
    height: 60px;
  }
</style>
