<template>
  <div class="login">
    <div class="logo-container">
      <img src="@/assets/images/logo02.png" alt="Logo" class="logo" />
    </div>

    <el-form
      ref="loginRef"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
    >
      <h3 class="title">代练侠</h3>

      <el-form-item prop="phone">
        <el-input
          v-model="loginForm.phone"
          type="text"
          autocomplete="off"
          placeholder="手机号"
        >
          <template #prepend>
            <span>+86</span>
          </template>
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          autocomplete="off"
          placeholder="密码"
          @keyup.enter="handleLogin"
        >
          <template #prepend>
            <span>账号</span>
          </template>
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input
          v-model="loginForm.code"
          autocomplete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter="handleLogin"
          key="captchaInput"
        >
          <template #prefix>
            <el-icon><Key /></el-icon>
          </template>
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" class="login-code-img" />
        </div>
      </el-form-item>

      <el-checkbox
        v-model="loginForm.rememberMe"
        style="margin: 0px 0px 25px 0px"
        >记住密码</el-checkbox
      >

      <el-form-item style="width: 100%">
        <el-button
          :loading="loading"
          type="primary"
          style="width: 100%"
          @click.prevent="handleLogin"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
        <div style="float: right" v-if="register">
          <router-link class="link-type" :to="'/register'"
            >立即注册</router-link
          >
        </div>
      </el-form-item>
    </el-form>

    <!-- 底部 -->
    <div class="el-login-footer">
      <span></span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getCodeImg } from '@/api/login/login'
import Cookies from 'js-cookie'
import { encrypt, decrypt } from '@/utils/jsencrypt'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { User, Lock, Key } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 数据初始化
const codeUrl = ref('')
const loginForm = ref({
  phone: '',
  password: '',
  rememberMe: false,
  code: '',
  uuid: '',
})
const loginRules = {
  phone: [{ required: true, trigger: 'blur', message: '请输入您的手机号' }],
  password: [{ required: true, trigger: 'blur', message: '请输入您的密码' }],
  code: [{ required: true, trigger: 'change', message: '请输入验证码' }],
}
const loading = ref(false)
const captchaEnabled = ref(true)
const register = ref(true)
const redirect = ref(undefined)

// 监听路由变化
watch(
  () => route.query,
  (newQuery) => {
    redirect.value = newQuery && newQuery.redirect
  },
  { immediate: true }
)

onMounted(() => {
  getCode()
  getCookie()
})

// 获取验证码
function getCode() {
  getCodeImg().then((res) => {
    captchaEnabled.value =
      res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = 'data:image/gif;base64,' + res.img
      loginForm.value.uuid = res.uuid
    }
  })
}

// 获取 Cookie
function getCookie() {
  const phone = Cookies.get('phone')
  const password = Cookies.get('password')
  const rememberMe = Cookies.get('rememberMe')

  loginForm.value.phone = phone || ''
  loginForm.value.password = password ? decrypt(password) : ''
  loginForm.value.rememberMe = rememberMe ? Boolean(rememberMe) : false
}
// 在 script setup 中合适的位置添加：
const loginRef = ref()
// 登录处理
function handleLogin() {
  loginRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      if (loginForm.value.rememberMe) {
        Cookies.set('phone', loginForm.value.phone, { expires: 30 })
        Cookies.set('password', encrypt(loginForm.value.password), {
          expires: 30,
        })
        Cookies.set('rememberMe', loginForm.value.rememberMe, { expires: 30 })
      } else {
        Cookies.remove('phone')
        Cookies.remove('password')
        Cookies.remove('rememberMe')
      }

      userStore
        .Login(loginForm.value)
        .then(() => {
          router.push({ path: redirect.value || '/' }).catch(() => {})
        })
        .catch(() => {
          loading.value = false
          if (captchaEnabled.value) {
            getCode()
          }
        })
    }
  })
}
</script>

<style rel="stylesheet/less" lang="less" scoped>
@primary-color: #707070;
@background-color: #ffffff;
@input-height: 38px;
@input-icon-height: 39px;
@input-icon-width: 14px;
@input-icon-margin-left: 2px;
@login-form-padding: 25px 25px 5px 25px;
@login-form-width: 400px;
@login-form-border-radius: 6px;
@login-tip-font-size: 13px;
@login-tip-color: #bfbfbf;
@login-code-width: 33%;
@login-code-height: 38px;
@login-code-img-height: 38px;
@el-login-footer-height: 40px;
@el-login-footer-font-size: 12px;
@el-login-footer-color: #fff;
@el-login-footer-font-family: Arial;
@el-login-footer-letter-spacing: 1px;

.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-image: url('@/assets/images/backgroundImage.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: @primary-color;
}

.login-form {
  border-radius: @login-form-border-radius;
  background: @background-color;
  width: @login-form-width;
  padding: @login-form-padding;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
}

.el-input {
  height: @input-height;
  input {
    height: @input-height;
    padding-left: 40px;
  }
}

.input-icon {
  height: @input-icon-height;
  width: @input-icon-width;
  margin-left: @input-icon-margin-left;
}

.login-tip {
  font-size: @login-tip-font-size;
  text-align: center;
  color: @login-tip-color;
}

.login-code {
  width: @login-code-width;
  height: @login-code-height;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.el-login-footer {
  height: @el-login-footer-height;
  line-height: @el-login-footer-height;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: @el-login-footer-color;
  font-family: @el-login-footer-font-family;
  font-size: @el-login-footer-font-size;
  letter-spacing: @el-login-footer-letter-spacing;
}

.login-code-img {
  height: @login-code-img-height;
}

.permanent-underline {
  text-decoration: underline;
}

.permanent-underline:hover {
  text-decoration: underline;
}

.logo-container {
  text-align: center;
  margin-bottom: 20px;
}

.logo {
  height: 200px; // 缩小 logo
  transition: transform 0.3s ease-in-out;
}

.logo:hover {
  transform: scale(1.05); // 鼠标悬停放大效果
}
</style>
