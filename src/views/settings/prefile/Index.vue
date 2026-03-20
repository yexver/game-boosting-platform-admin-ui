<template>
  <div class="system-settings-container">
    <el-card>
      <template #header>
        <h3>系统设置</h3>
      </template>

      <el-form label-width="150px" :model="settingsForm" ref="formRef">
        <el-divider>基础设置</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="网站名称">
              <el-input v-model="settingsForm.siteName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="网站域名">
              <el-input v-model="settingsForm.domain" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认语言">
              <el-select
                v-model="settingsForm.defaultLanguage"
                placeholder="请选择语言"
              >
                <el-option label="中文" value="zh" />
                <el-option label="英文" value="en" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时区设置">
              <el-select
                v-model="settingsForm.timezone"
                placeholder="请选择时区"
              >
                <el-option label="UTC+8" value="8" />
                <el-option label="UTC+7" value="7" />
                <el-option label="UTC+9" value="9" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider>邮件设置</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="SMTP服务器">
              <el-input v-model="settingsForm.smtpServer" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="SMTP端口">
              <el-input v-model.number="settingsForm.smtpPort" type="number" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱账号">
              <el-input v-model="settingsForm.emailAccount" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱密码">
              <el-input
                v-model="settingsForm.emailPassword"
                type="password"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider>其他设置</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="登录失败次数限制">
              <el-input
                v-model.number="settingsForm.loginAttempts"
                type="number"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="会话超时时间（分钟）">
              <el-input
                v-model.number="settingsForm.sessionTimeout"
                type="number"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="维护模式">
              <el-switch
                v-model="settingsForm.maintenanceMode"
                active-value="on"
                inactive-value="off"
              />
              <span class="el-form-item__info">开启后只有管理员可以访问</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">保存设置</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 组件名称注释
// 注意：由于使用了<script setup>语法，组件名称将从文件名推导（SettingsIndex）
const settingsForm = ref({
  siteName: '游戏代练平台',
  domain: 'www.example.com',
  defaultLanguage: 'zh',
  timezone: '8',
  smtpServer: 'smtp.example.com',
  smtpPort: 25,
  emailAccount: 'admin@example.com',
  emailPassword: 'password',
  loginAttempts: 5,
  sessionTimeout: 30,
  maintenanceMode: 'off',
})

const handleSubmit = () => {
  console.log('提交设置', settingsForm.value)
}

const handleCancel = () => {
  console.log('取消设置')
}
</script>
