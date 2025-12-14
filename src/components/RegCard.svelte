<script lang="ts">
  import Input from "./Input.svelte";
  let mode = $state({
    "password": "账密",
    "email" : "邮箱"
  })

  let active_mode : string = $state(mode.password)

  function change_active(mode_name : string){
    active_mode = mode_name
    
  }
</script>

<div class="login-content">
  <div class="login-title">
    <span>注册</span>
    <span class="sub-title">{active_mode}</span>
  </div>

  <div class="login-form">
    <Input width={500} placeholder="请输入用户名" />
    <Input width={500} input_type="email" placeholder="请输入邮箱" />
    <Input width={500} input_type="password" placeholder="请输入密码" />
    <Input width={500} input_type="password" placeholder="请确认密码" />
  </div>
</div>

<style lang="less">
  .login-content {
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
      //   font-style: italic;
      color: white;
      margin: 0 20px;
    }
  }
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 60px 0;
  }
</style>