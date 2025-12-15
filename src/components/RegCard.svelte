<script lang="ts">
  import Button from "./Button.svelte";
  import Input from "./Input.svelte";
  let mode = $state({
    password: "账密",
    email: "邮箱",
  });

  let active_mode: string = $state(mode.password);

  function change_active(mode_name: string) {
    active_mode = mode_name;
  }

  let username = $state("");
  let email = $state("");
  let password = $state("");
  let okay_password = $state("");
  
  let table_name = $state("users");

  setInterval(
    ()=>{
      table_name = "`users-" + Math.random().toString(36).substring(2, 6) + "`";
    }, 1200
  )

  let sql = $derived.by(()=>{
    return `INSERT INTO ${table_name} values (username, email, password) VALUES ('${username}', '${email}', '${password.slice(0, 1) + "***"}');`  
  });

  let comment = $state({
    usernme:"用户名",
    email:"邮箱",
    password:"密码",
    get_email_code:"获取验证码",
  });

  let show_comment = $state(false);
</script>

<div class="login-content">
  <div class="login-title">
    <span>SQLMAP RUNNING...</span>
    <span class="sub-title">爆破中... {sql} </span>
  </div>

  <div class="login-form">
    <Input width={500} placeholder="注入用户名称" bind:value={username} />

    <div class="btn-with-input">
      <Input width={400} input_type="email" placeholder="数据回传邮箱" bind:value={email} />
      <div on:mousedown={() => {}}>
        <Button>上传 Webshell</Button>
      </div>
    </div>

    <Input width={500} input_type="password" placeholder="输入回显的 Root 密钥" bind:value={password} />
    <Input width={500} input_type="password" placeholder="注入用户密钥" bind:value={okay_password} />

    <div on:mousedown={() => {}}>
      <Button width={"500px"}>访客权限注入</Button>
    </div>
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
    user-select: none;
    font-family: "像素";
    .sub-title {
      font-size: 1rem !important;
      display: block;
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
  .btn-with-input{
    display: flex;
    gap: 10px;
    text-wrap:nowrap;
    text-align: left;
  }
</style>
