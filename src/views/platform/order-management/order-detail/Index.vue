<template>
  <div class="order-detail-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <template v-else-if="orderDetail">
      <el-row :gutter="20">
        <!-- 左侧：订单基本信息 -->
        <el-col :span="16">
          <el-card class="mb-4">
            <template #header>
              <div class="card-header">
                <span>订单信息</span>
                <el-tag :type="getStatusType(orderDetail.status)">
                  {{ statusMap[orderDetail.status] || orderDetail.status }}
                </el-tag>
              </div>
            </template>

            <el-descriptions :column="2" border>
              <el-descriptions-item label="订单号">
                {{ orderDetail.orderNo }}
              </el-descriptions-item>
              <el-descriptions-item label="订单类型">
                {{ boostingTypeMap[orderDetail.boostingType] || '代练' }}
              </el-descriptions-item>
              <el-descriptions-item label="游戏">
                {{ orderDetail.gameName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="系统">
                {{ orderDetail.systemName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="服务区">
                {{ orderDetail.serverName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="订单标题">
                {{ orderDetail.title || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="订单金额">
                <span class="price-text">￥{{ orderDetail.price || 0 }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="平台服务费">
                <span class="fee-text">￥{{ orderDetail.platformFee || 0 }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="安全保证金">
                ￥{{ orderDetail.securityDeposit || 0 }}
              </el-descriptions-item>
              <el-descriptions-item label="效率保证金">
                ￥{{ orderDetail.efficiencyDeposit || 0 }}
              </el-descriptions-item>
              <el-descriptions-item label="代练时限">
                {{ orderDetail.timeLimit || '-' }} 小时
              </el-descriptions-item>
              <el-descriptions-item label="付款状态">
                <el-tag :type="orderDetail.paid === 1 ? 'success' : 'warning'" size="small">
                  {{ orderDetail.paid === 1 ? '已付款' : '未付款' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="下单时间">
                {{ formatTime(orderDetail.createdAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="开始时间">
                {{ formatTime(orderDetail.startAt) || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="完成时间">
                {{ formatTime(orderDetail.actualAt) || '-' }}
              </el-descriptions-item>
            </el-descriptions>

            <el-divider content-position="left">订单描述</el-divider>
            <div class="description-text">
              {{ orderDetail.description || '无' }}
            </div>

            <el-divider content-position="left">账号信息</el-divider>
            <div class="description-text">
              {{ orderDetail.accountInfo || '无' }}
            </div>
          </el-card>

          <!-- 状态日志 -->
          <el-card class="mb-4">
            <template #header>
              <div class="card-header">
                <span>订单状态日志</span>
                <el-button size="small" text @click="statusLogsExpanded = !statusLogsExpanded">
                  {{ statusLogsExpanded ? '收起' : '展开' }}
                </el-button>
              </div>
            </template>

            <el-timeline v-if="statusLogs.length > 0">
              <el-timeline-item
                v-for="(log, index) in (statusLogsExpanded ? statusLogs : statusLogs.slice(0, 3))"
                :key="log.id || index"
                :timestamp="formatTime(log.createdAt)"
                :color="getLogColor(log.toStatus)"
                placement="top"
              >
                <el-card shadow="hover">
                  <p>
                    <el-tag size="small" type="info">
                      {{ statusMap[log.fromStatus] || log.fromStatus || '初始' }}
                    </el-tag>
                    <el-icon><Right /></el-icon>
                    <el-tag size="small" :type="getStatusType(log.toStatus)">
                      {{ statusMap[log.toStatus] || log.toStatus }}
                    </el-tag>
                  </p>
                  <p class="log-info">
                    <el-avatar
                      v-if="log.operatorAvatar"
                      :src="getFullAvatarUrl(log.operatorAvatar)"
                      :size="20"
                    />
                    <span>{{ log.operatorName || '系统' }}</span>
                    <span class="log-remark" v-if="log.remark">：{{ log.remark }}</span>
                  </p>
                  <p v-if="log.price !== null && log.price !== undefined">
                    订单申请支付：￥{{ log.price }}
                  </p>
                  <p v-if="log.deposit !== null && log.deposit !== undefined">
                    保证金申请支付：￥{{ log.deposit }}
                  </p>
                  <!-- 凭证图片 -->
                  <div v-if="log.imageUrls" class="log-images">
                    <el-image
                      v-for="(img, idx) in getImageList(log.imageUrls)"
                      :key="img + idx"
                      :src="getFullImageUrl(img)"
                      :preview-src-list="getImageList(log.imageUrls).map(i => getFullImageUrl(i))"
                      :initial-index="idx"
                      fit="cover"
                      class="log-image"
                      preview-teleported
                    />
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无状态日志" />

            <div v-if="statusLogs.length > 3" class="expand-btn">
              <el-button link type="primary" @click="statusLogsExpanded = !statusLogsExpanded">
                {{ statusLogsExpanded ? '收起更多' : `展开全部（${statusLogs.length}条）` }}
              </el-button>
            </div>
          </el-card>

          <!-- 订单消息 -->
          <el-card>
            <template #header>
              <div class="card-header">
                <span>订单消息记录</span>
                <el-button size="small" text @click="refreshMessages">
                  <el-icon><Refresh /></el-icon> 刷新
                </el-button>
              </div>
            </template>

            <el-timeline v-if="messageList.length > 0">
              <el-timeline-item
                v-for="(msg, index) in messageList"
                :key="msg.id || index"
                :timestamp="formatTime(msg.createdAt)"
                :type="getMsgType(msg)"
                placement="top"
              >
                <div class="message-item">
                  <el-avatar v-if="getMsgAvatar(msg)" :src="getMsgAvatar(msg)" :size="24" />
                  <span class="msg-username">{{ getMsgUsername(msg) }}：</span>
                  <span class="msg-content">{{ msg.content }}</span>
                </div>
                <!-- 消息图片 -->
                <div v-if="msg.fileUrl" class="msg-images">
                  <el-image
                    v-for="(img, idx) in getImageList(msg.fileUrl)"
                    :key="img + idx"
                    :src="getFullImageUrl(img)"
                    :preview-src-list="getImageList(msg.fileUrl).map(i => getFullImageUrl(i))"
                    :initial-index="idx"
                    fit="cover"
                    class="msg-image"
                    preview-teleported
                  />
                </div>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无消息记录" />
          </el-card>
        </el-col>

        <!-- 右侧：用户信息和操作 -->
        <el-col :span="8">
          <!-- 发布者信息 -->
          <el-card class="mb-4">
            <template #header>
              <div class="card-header">
                <span>发布者</span>
                <el-tag type="info" size="small">发单用户</el-tag>
              </div>
            </template>

            <div class="user-card">
              <el-avatar
                :src="getFullAvatarUrl(orderDetail.publisher?.avatar)"
                :size="60"
              />
              <div class="user-info">
                <p class="username">{{ orderDetail.publisher?.username || '-' }}</p>
                <p class="user-id">ID: {{ orderDetail.publisher?.userId || '-' }}</p>
                <p class="user-phone" v-if="orderDetail.publisher?.phone">
                  手机: {{ orderDetail.publisher.phone }}
                </p>
              </div>
            </div>

            <div class="action-buttons">
              <el-button type="primary" @click="contactUser(orderDetail.publisher?.userId)">
                <el-icon><ChatDotRound /></el-icon> 联系发单者
              </el-button>
            </div>
          </el-card>

          <!-- 接手者信息 -->
          <el-card class="mb-4">
            <template #header>
              <div class="card-header">
                <span>接手者</span>
                <el-tag type="warning" size="small">接单用户</el-tag>
              </div>
            </template>

            <div class="user-card">
              <el-avatar
                :src="getFullAvatarUrl(orderDetail.taker?.avatar)"
                :size="60"
              />
              <div class="user-info">
                <p class="username">{{ orderDetail.taker?.username || '-' }}</p>
                <p class="user-id">ID: {{ orderDetail.taker?.userId || '-' }}</p>
                <p class="user-phone" v-if="orderDetail.taker?.phone">
                  手机: {{ orderDetail.taker.phone }}
                </p>
              </div>
            </div>

            <div class="action-buttons">
              <el-button type="warning" @click="contactUser(orderDetail.taker?.userId)">
                <el-icon><ChatDotRound /></el-icon> 联系接单者
              </el-button>
            </div>
          </el-card>

          <!-- 介入客服信息 -->
          <el-card v-if="orderDetail.manager" class="mb-4">
            <template #header>
              <div class="card-header">
                <span>介入客服</span>
                <el-tag type="danger" size="small">客服</el-tag>
              </div>
            </template>

            <div class="user-card">
              <el-avatar
                :src="getFullAvatarUrl(orderDetail.manager?.avatar)"
                :size="60"
              />
              <div class="user-info">
                <p class="username">{{ orderDetail.manager?.username || '-' }}</p>
                <p class="user-id">ID: {{ orderDetail.manager?.userId || '-' }}</p>
              </div>
            </div>
          </el-card>

          <!-- 快捷操作 -->
          <el-card>
            <template #header>
              <span>快捷操作</span>
            </template>

            <div class="quick-actions">
              <el-button
                v-if="orderDetail.status === 8"
                type="danger"
                class="action-btn"
                @click="handleIntervene"
              >
                <el-icon><Warning /></el-icon> 介入订单
              </el-button>

              <el-button
                v-if="orderDetail.status === 9"
                type="warning"
                class="action-btn"
                @click="showArbitrateDialog"
              >
                <el-icon><ScaleToOriginal /></el-icon> 仲裁订单
              </el-button>

              <el-button type="info" class="action-btn" @click="handleCopyOrderNo">
                <el-icon><DocumentCopy /></el-icon> 复制订单号
              </el-button>

              <el-button type="default" class="action-btn" @click="handleGoBack">
                <el-icon><ArrowLeft /></el-icon> 返回列表
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </template>

    <!-- 订单不存在 -->
    <el-empty v-else description="订单不存在或加载失败" />

    <!-- 仲裁订单对话框 -->
    <el-dialog v-model="arbitrateDialogVisible" title="仲裁订单" width="450px">
      <div class="arbitrate-info">
        <p><strong>订单号：</strong>{{ orderDetail?.orderNo }}</p>
        <p><strong>订单金额：</strong>￥{{ orderDetail?.price || 0 }}</p>
        <p><strong>可用保证金：</strong>￥{{ totalDeposit }}</p>
      </div>

      <el-form
        :model="arbitrateForm"
        :rules="arbitrateRules"
        label-width="100px"
        ref="arbitrateFormRef"
      >
        <el-form-item label="订单金额支付" prop="payAmount">
          <el-input-number
            v-model="arbitrateForm.payAmount"
            :min="0"
            :max="orderDetail?.price || 0"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="保证金支付" prop="depositAmount">
          <el-input-number
            v-model="arbitrateForm.depositAmount"
            :min="0"
            :max="totalDeposit"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="仲裁说明" prop="remark">
          <el-input
            v-model="arbitrateForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入仲裁说明..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="arbitrateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitArbitrate">提交仲裁</el-button>
      </template>
    </el-dialog>

    <!-- 仲裁成功对话框 -->
    <el-dialog
      v-model="arbitrateSuccessVisible"
      title="仲裁成功"
      width="320px"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <div style="text-align: center; padding: 20px 0">
        <el-icon style="color: #67c23a; font-size: 48px"><SuccessFilled /></el-icon>
        <div style="margin-top: 16px; font-size: 16px">仲裁提交成功！</div>
      </div>
      <template #footer>
        <el-button type="primary" @click="handleArbitrateSuccess">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getOrderDetail,
  getOrderMessages,
  interveneOrder,
  arbitrateOrder,
} from '@/api/order'
import {
  ElMessage,
  ElMessageBox,
} from 'element-plus'
import {
  Loading,
  Right,
  Refresh,
  ChatDotRound,
  Warning,
  ScaleToOriginal,
  DocumentCopy,
  ArrowLeft,
  SuccessFilled,
} from '@element-plus/icons-vue'
import settings from '@/settings'

const route = useRoute()
const router = useRouter()

// 状态映射
const statusMap = {
  1: '未接手',
  2: '代练中',
  3: '待验收',
  4: '验收中',
  5: '已完成',
  6: '已撤销',
  7: '撤销中',
  8: '待介入',
  9: '介入中',
  10: '已仲裁',
  12: '已仲裁',
}

const boostingTypeMap = {
  1: '普通代练',
  2: '陪练',
}

const statusTypeMap = {
  1: 'info',
  2: 'warning',
  3: 'warning',
  4: 'warning',
  5: 'success',
  6: 'info',
  7: 'warning',
  8: 'danger',
  9: 'danger',
  10: 'info',
  12: 'info',
}

function getStatusType(status) {
  return statusTypeMap[status] || 'info'
}

function getLogColor(status) {
  const colorMap = {
    1: '#909399',
    2: '#E6A23C',
    3: '#E6A23C',
    5: '#67C23A',
    6: '#909399',
    7: '#E6A23C',
    8: '#F56C6C',
    9: '#F56C6C',
    10: '#909399',
  }
  return colorMap[status] || '#409EFF'
}

// 加载状态
const loading = ref(true)
const orderDetail = ref(null)
const messageList = ref([])
const statusLogsExpanded = ref(false)

// 计算属性
const statusLogs = computed(() => {
  return orderDetail.value?.statusLogs || []
})

const totalDeposit = computed(() => {
  const security = Number(orderDetail.value?.securityDeposit) || 0
  const efficiency = Number(orderDetail.value?.efficiencyDeposit) || 0
  return security + efficiency
})

// 仲裁对话框
const arbitrateDialogVisible = ref(false)
const arbitrateSuccessVisible = ref(false)
const arbitrateForm = reactive({
  payAmount: 0,
  depositAmount: 0,
  remark: '',
})
const arbitrateRules = {
  payAmount: [
    { required: true, message: '请输入订单金额支付', trigger: 'blur' },
  ],
  depositAmount: [
    { required: true, message: '请输入保证金支付', trigger: 'blur' },
  ],
  remark: [
    { required: true, message: '请输入仲裁说明', trigger: 'blur' },
  ],
}

// 获取订单详情
async function fetchOrderDetail(orderId) {
  loading.value = true
  try {
    const res = await getOrderDetail(orderId)
    if (res.code === 200) {
      orderDetail.value = res.data
    } else {
      ElMessage.error(res.msg || '获取订单详情失败')
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  } finally {
    loading.value = false
  }
}

// 获取订单消息
async function fetchOrderMessages(orderId) {
  try {
    const res = await getOrderMessages(orderId)
    if (res.code === 200) {
      messageList.value = Array.isArray(res.data)
        ? res.data
        : res.data?.list || []
    }
  } catch (error) {
    console.error('获取订单消息失败:', error)
  }
}

// 刷新消息
function refreshMessages() {
  const orderId = route.params.id
  if (orderId) {
    fetchOrderMessages(orderId)
  }
}

// 消息相关方法
function getMsgAvatar(msg) {
  if (!orderDetail.value) return ''
  let avatar = ''
  if (msg.senderId === orderDetail.value.publisher?.userId) {
    avatar = orderDetail.value.publisher?.avatar
  } else if (msg.senderId === orderDetail.value.taker?.userId) {
    avatar = orderDetail.value.taker?.avatar
  } else if (msg.senderId === orderDetail.value.manager?.userId) {
    avatar = orderDetail.value.manager?.avatar
  }
  if (!avatar) return ''
  avatar = avatar.trim()
  return avatar.toLowerCase().startsWith('http')
    ? avatar
    : settings.imgBaseUrl + avatar
}

function getMsgUsername(msg) {
  if (!orderDetail.value) return ''
  if (msg.senderId === orderDetail.value.publisher?.userId) {
    return orderDetail.value.publisher?.username || '发单者'
  }
  if (msg.senderId === orderDetail.value.taker?.userId) {
    return orderDetail.value.taker?.username || '接单者'
  }
  if (msg.senderId === orderDetail.value.manager?.userId) {
    return orderDetail.value.manager?.username || '客服'
  }
  if (msg.senderId === '0' || msg.senderType === 2) {
    return '系统'
  }
  if (msg.senderType === 3) {
    return '客服'
  }
  return `用户${msg.senderId}`
}

function getMsgType(msg) {
  if (msg.senderId === '0' || msg.senderType === 2) return 'info'
  if (msg.senderType === 3) return 'warning'
  if (msg.senderId === orderDetail.value?.taker?.userId) return 'primary'
  return 'default'
}

// 工具方法
function getFullAvatarUrl(avatar) {
  if (!avatar) return ''
  const trimmed = avatar.trim()
  return trimmed.toLowerCase().startsWith('http')
    ? trimmed
    : settings.imgBaseUrl + trimmed
}

function getFullImageUrl(img) {
  if (!img) return ''
  const trimmed = img.trim()
  return trimmed.toLowerCase().startsWith('http')
    ? trimmed
    : settings.imgBaseUrl + trimmed
}

function getImageList(imageUrls) {
  if (!imageUrls) return []
  return imageUrls.split(',').filter(Boolean)
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  let date
  if (typeof timestamp === 'number') {
    date = timestamp > 1e12 ? new Date(timestamp) : new Date(timestamp * 1000)
  } else if (typeof timestamp === 'string' && /^\d+$/.test(timestamp)) {
    const num = Number(timestamp)
    date = num > 1e12 ? new Date(num) : new Date(num * 1000)
  } else {
    date = new Date(timestamp)
  }
  if (isNaN(date.getTime())) return ''
  return date.toLocaleString('zh-CN')
}

// 联系用户
function contactUser(userId) {
  if (!userId) {
    ElMessage.warning('用户ID不存在')
    return
  }
  window.open(`http://localhost:5173/chat/${userId}`, '_blank')
}

// 介入订单
function handleIntervene() {
  if (!orderDetail.value) return
  ElMessageBox.confirm(
    `确定要介入订单 ${orderDetail.value.orderNo} 吗？`,
    '确认介入',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await interveneOrder(orderDetail.value.id)
      if (res.code === 200) {
        ElMessage.success('介入成功')
        fetchOrderDetail(orderDetail.value.id)
      } else {
        ElMessage.error(res.msg || '介入失败')
      }
    } catch {
      ElMessage.error('介入失败')
    }
  }).catch(() => {})
}

// 仲裁订单
function showArbitrateDialog() {
  if (!orderDetail.value) return
  arbitrateForm.payAmount = 0
  arbitrateForm.depositAmount = 0
  arbitrateForm.remark = ''
  arbitrateDialogVisible.value = true
}

const arbitrateFormRef = ref()

async function submitArbitrate() {
  if (!arbitrateFormRef.value) return
  try {
    await arbitrateFormRef.value.validate()
  } catch {
    return
  }

  try {
    const res = await arbitrateOrder({
      orderId: orderDetail.value.id,
      payAmount: arbitrateForm.payAmount,
      depositAmount: arbitrateForm.depositAmount,
      remark: arbitrateForm.remark,
    })
    if (res.code === 200) {
      arbitrateDialogVisible.value = false
      arbitrateSuccessVisible.value = true
    } else {
      ElMessage.error(res.msg || '仲裁提交失败')
    }
  } catch {
    ElMessage.error('仲裁提交失败')
  }
}

function handleArbitrateSuccess() {
  arbitrateSuccessVisible.value = false
  fetchOrderDetail(orderDetail.value.id)
}

// 复制订单号
function handleCopyOrderNo() {
  if (!orderDetail.value?.orderNo) return
  navigator.clipboard.writeText(orderDetail.value.orderNo).then(() => {
    ElMessage.success('订单号已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// 返回列表
function handleGoBack() {
  router.push('/order-management/order')
}

// 初始化
onMounted(() => {
  const orderId = route.params.id
  if (orderId) {
    fetchOrderDetail(orderId)
    fetchOrderMessages(orderId)
  } else {
    loading.value = false
    ElMessage.error('订单ID不存在')
  }
})
</script>

<style scoped>
.order-detail-container {
  padding: 10px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: #909399;
  font-size: 16px;
}

.loading-container .el-icon {
  font-size: 24px;
  margin-right: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-text {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}

.fee-text {
  color: #909399;
}

.description-text {
  color: #606266;
  line-height: 1.8;
  padding: 8px 0;
}

.log-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}

.log-remark {
  color: #606266;
}

.log-images,
.msg-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.log-image,
.msg-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  cursor: pointer;
}

.expand-btn {
  text-align: center;
  margin-top: 16px;
}

.message-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.msg-username {
  font-weight: 500;
  color: #303133;
}

.msg-content {
  color: #606266;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.user-info {
  flex: 1;
}

.user-info .username {
  font-weight: 600;
  font-size: 16px;
  margin: 0 0 4px 0;
}

.user-info .user-id,
.user-info .user-phone {
  font-size: 12px;
  color: #909399;
  margin: 2px 0;
}

.action-buttons {
  margin-top: 16px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  width: 100%;
}

.arbitrate-info {
  background: #f5f7fa;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.arbitrate-info p {
  margin: 4px 0;
  color: #606266;
}
</style>
