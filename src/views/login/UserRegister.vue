<template>
  <div class="register-container">
    <div class="logo-container">
      <img src="@/assets/images/logo02.png" alt="Logo" class="logo" />
    </div>
    <el-form
      :model="registerForm"
      :rules="rules"
      ref="formRef"
      label-width="100px"
      class="register-form"
    >
      <h2 class="register-title">注册</h2>
      <el-form-item label="创建用户名" prop="username">
        <el-input
          v-model="registerForm.username"
          prefix-icon="User"
          size="large"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="registerForm.phone"
          maxlength="11"
          prefix-icon="Iphone"
          size="large"
          type="text"
        />
      </el-form-item>
      <el-form-item label="验证码" prop="code">
        <el-input
          v-model="registerForm.code"
          maxlength="6"
          size="large"
          prefix-icon="Key"
          style="width: 70%"
        />
        <el-button
          :disabled="smsCountdown > 0 || !registerForm.phone"
          @click="sendSmsCode"
          size="large"
          style="width: 28%; margin-left: 2%"
        >
          <span v-if="smsCountdown === 0">获取验证码</span>
          <span v-else>{{ smsCountdown }}秒后重试</span>
        </el-button>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="registerForm.email"
          prefix-icon="Message"
          size="large"
        />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="registerForm.password"
          type="password"
          show-password
          prefix-icon="Lock"
          size="large"
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          show-password
          prefix-icon="Lock"
          size="large"
        />
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="registerForm.rememberMe">记住密码</el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-button
          type="default"
          @click="goToLogin"
          size="large"
          style="width: 48%"
        >
          返回登录
        </el-button>
        <el-button
          type="primary"
          @click="onSubmit"
          :loading="loading"
          size="large"
          style="width: 48%; margin-left: 4%"
        >
          注册
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import { sendSms } from '@/api/login/login'
import { useUserStore } from '@/stores'
const router = useRouter()
const userStore = useUserStore()

const registerForm = ref({
  username: '',
  phone: '',
  code: '',
  email: '',
  password: '',
  confirmPassword: '',
  rememberMe: false,
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      validator: (rule, value) => /^1[3-9]\d{9}$/.test(value),
      message: '手机号格式不正确',
      trigger: 'blur',
    },
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value) => value === registerForm.value.password,
      message: '两次密码不一致',
      trigger: 'blur',
    },
  ],
}

const formRef = ref()
const loading = ref(false)
const smsCountdown = ref(0)
let smsTimer = null

onMounted(() => {})

// 发送验证码
function sendSmsCode() {
  console.log(
    'phone:',
    registerForm.value.phone,
    typeof registerForm.value.phone
  )
  if (!/^1[3-9]\d{9}$/.test(registerForm.value.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  sendSms(registerForm.value.phone)
    .then(() => {
      ElMessage.success('验证码已发送')
      smsCountdown.value = 60
      smsTimer = setInterval(() => {
        smsCountdown.value--
        if (smsCountdown.value <= 0) clearInterval(smsTimer)
      }, 1000)
    })
    .catch(() => {
      ElMessage.error('验证码发送失败')
    })
}

// 注册
function onSubmit() {
  formRef.value.validate((valid) => {
    if (!valid) return
    if (registerForm.value.password !== registerForm.value.confirmPassword) {
      ElMessage.error('两次密码不一致')
      return
    }
    loading.value = true
    userStore
      .Register({
        username: registerForm.value.username,
        phone: registerForm.value.phone,
        email: registerForm.value.email,
        password: registerForm.value.password,
        code: registerForm.value.code,
      })
      .then(() => {
        ElMessage.success('注册成功')
        if (registerForm.value.rememberMe) {
          Cookies.set('phone', registerForm.value.phone, { expires: 30 })
          Cookies.set('password', registerForm.value.password, { expires: 30 })
          Cookies.set('rememberMe', true, { expires: 30 })
        }
        router.push('/') // 注册成功后跳转到首页
      })
      .catch((e) => {
        console.log(e)
      })
      .finally(() => {
        loading.value = false
      })
  })
}

function goToLogin() {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center; /* 右对齐 */
  min-height: 100vh;
  width: 100vw;
  background-image: url('@/assets/images/backgroundImage.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}
.logo-container {
  text-align: center;
  margin-bottom: 20px;
}
.logo {
  height: 200px;
  transition: transform 0.3s ease-in-out;
}
.logo:hover {
  transform: scale(1.05);
}
.register-form {
  border-radius: 6px;
  background: #fff;
  width: 400px;
  padding: 25px 25px 5px 25px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
}
.register-title {
  margin: 0px auto 24px auto;
  text-align: center;
  color: #707070;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 2px;
}
.register-form :deep(.el-form-item) {
  margin-bottom: 22px;
}
.register-form :deep(.el-input__wrapper) {
  min-height: 38px;
}
.el-button {
  font-size: 16px;
}
/* 只影响当前注册页的输入框 */
.register-form :deep(.el-input__wrapper) {
  padding-left: 32px !important; /* 默认是36px或40px，可适当减小 */
}
.register-form :deep(.el-input__prefix) {
  left: 8px !important; /* 图标距离左侧的距离 */
}
/* 增大输入框图标和内容之间的间距 */
.register-form :deep(.el-input__prefix) {
  margin-right: 12px; /* 默认是8px，改为12px或更大 */
}
/* 只影响验证码输入框 */
.register-form :deep(.code-input .el-input__wrapper) {
  padding-left: 28px !important;
}
@media (max-width: 500px) {
  .register-form {
    width: 95vw;
    min-width: 0;
    padding: 16px 4vw 5px 4vw;
  }
  .logo {
    height: 120px;
  }
}
</style>
