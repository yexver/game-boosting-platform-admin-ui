<template>
  <div class="exception-order-manage-container">
    <el-card>
      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" style="margin-bottom: 16px">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderNo" placeholder="订单号" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchList">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 异常订单管理表格 -->
      <el-table :data="orderList" border style="width: 100%">
        <el-table-column
          prop="orderNo"
          label="订单号"
          width="180"
          show-overflow-tooltip
        />
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column
          prop="publisherUsername"
          label="发布者"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="takerUsername"
          label="接手者"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="price"
          label="金额"
          width="100"
          show-overflow-tooltip
        />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 9" type="danger">介入中</el-tag>
            <el-tag v-else-if="row.status === 10" type="info">已仲裁</el-tag>
            <el-tag v-else type="warning">异常</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="updatedAt"
          label="更新时间"
          width="160"
          :formatter="formatTimeCell"
        />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleManage(row)"
              >处理</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @update:current-page="handleCurrentChange"
        @update:page-size="handleSizeChange"
        layout="prev, pager, next, sizes, total"
        :page-sizes="[10, 20, 50, 100]"
        style="margin-top: 16px"
      />
    </el-card>
  </div>
  <el-dialog v-model="dialogVisible" title="订单处理" width="800px">
    <div v-if="loadingDetail" style="text-align: center; padding: 40px 0">
      <el-icon><loading /></el-icon> 加载中...
    </div>
    <div v-else>
      <div v-if="currentOrder">
        <div style="display: flex; align-items: center; gap: 24px">
          <el-avatar
            :src="
              currentOrder.gameIcon
                ? currentOrder.gameIcon.trim().toLowerCase().startsWith('http')
                  ? currentOrder.gameIcon.trim()
                  : settings.imgBaseUrl + currentOrder.gameIcon.trim()
                : ''
            "
            size="large"
            v-if="currentOrder.gameIcon"
          />
          <div>
            <p><b>订单号：</b>{{ currentOrder.orderNo }}</p>
            <p><b>标题：</b>{{ currentOrder.title }}</p>
            <p>
              <b>订单类型：</b
              >{{
                boostingTypeMap[currentOrder.boostingType] ||
                currentOrder.boostingType
              }}
            </p>
            <p><b>游戏：</b>{{ currentOrder.gameName }}</p>
            <p><b>系统：</b>{{ currentOrder.systemName }}</p>
            <p v-if="currentOrder.serverName">
              <b>服务区：</b>{{ currentOrder.serverName }}
            </p>
            <p><b>金额：</b>{{ currentOrder.price }}</p>
            <p>
              <b>状态：</b
              >{{ orderStatusMap[currentOrder.status] || currentOrder.status }}
            </p>
            <p><b>下单时间：</b>{{ formatTimeCell(currentOrder.createdAt) }}</p>
            <p v-if="currentOrder.startAt">
              <b>开始时间：</b>{{ formatTimeCell(currentOrder.startAt) }}
            </p>
            <p v-if="currentOrder.actualAt">
              <b>完成时间：</b>{{ formatTimeCell(currentOrder.actualAt) }}
            </p>
          </div>
          <div>
            <p>
              <b>发布者：</b>
              <el-avatar
                :src="
                  currentOrder.publisher?.avatar
                    ? settings.imgBaseUrl + currentOrder.publisher.avatar
                    : ''
                "
                size="small"
                v-if="currentOrder.publisher?.avatar"
              />
              {{ currentOrder.publisher?.username }}
            </p>
            <p>
              <b>接手者：</b>
              <el-avatar
                :src="
                  currentOrder.taker?.avatar
                    ? settings.imgBaseUrl + currentOrder.taker.avatar
                    : ''
                "
                size="small"
                v-if="currentOrder.taker?.avatar"
              />
              {{ currentOrder.taker?.username }}
            </p>
          </div>
        </div>
        <el-divider>订单详情</el-divider>
        <p><b>描述：</b>{{ currentOrder.description }}</p>
        <p><b>账号信息：</b>{{ currentOrder.accountInfo }}</p>
        <p><b>时限：</b>{{ currentOrder.timeLimit }} 小时</p>
        <p><b>安全保证金：</b>{{ currentOrder.securityDeposit }}</p>
        <p><b>效率保证金：</b>{{ currentOrder.efficiencyDeposit }}</p>
        <el-divider>订单状态流转</el-divider>
        <el-timeline>
          <el-timeline-item
            v-for="log in currentOrder.statusLogs || []"
            :key="log.id"
            :timestamp="`订单状态：从【${orderStatusMap[log.fromStatus] || log.fromStatus}】变为【${orderStatusMap[log.toStatus] || log.toStatus}】 ${formatTimeCell(log.createdAt)}`"
          >
            <el-avatar
              :src="
                log.operatorAvatar
                  ? settings.imgBaseUrl + log.operatorAvatar
                  : ''
              "
              size="small"
              v-if="log.operatorAvatar"
              style="margin-right: 8px"
            />
            <span>{{ log.operatorName }}：</span>
            <span>说明：{{ log.remark }}</span>
            <span v-if="log.price !== null && log.price !== undefined"
              >，订单申请支付：￥{{ log.price }}</span
            >
            <span v-if="log.deposit !== null && log.deposit !== undefined"
              >，订单保证金申请支付：￥{{ log.deposit }}</span
            >
            <span v-if="log.imageUrls">
              <template
                v-for="(img, idx) in log.imageUrls.split(',').filter(Boolean)"
                :key="img + idx"
              >
                <el-image
                  :src="
                    img.trim().toLowerCase().startsWith('http')
                      ? img.trim()
                      : settings.imgBaseUrl + img.trim()
                  "
                  style="
                    max-width: 60px;
                    vertical-align: middle;
                    cursor: pointer;
                    margin-right: 4px;
                  "
                  :preview-src-list="
                    log.imageUrls
                      .split(',')
                      .filter(Boolean)
                      .map((i) =>
                        i.trim().toLowerCase().startsWith('http')
                          ? i.trim()
                          : settings.imgBaseUrl + i.trim()
                      )
                  "
                  :initial-index="idx"
                  preview-teleported
                />
              </template>
            </span>
          </el-timeline-item>
        </el-timeline>
      </div>
      <el-divider>订单消息</el-divider>
      <el-timeline>
        <el-timeline-item
          v-for="msg in messageList"
          :key="msg.id"
          :timestamp="formatTimeCell(msg.createdAt)"
        >
          <el-avatar
            v-if="getMsgAvatar(msg)"
            :src="getMsgAvatar(msg)"
            size="small"
            style="margin-right: 8px"
          />
          <span>{{ getMsgUsername(msg) }}：</span>
          <span>{{ msg.content }}</span>
          <!-- 新增图片展示 -->
          <span v-if="msg.fileUrl">
            <template
              v-for="(img, idx) in msg.fileUrl.split(',').filter(Boolean)"
              :key="img + idx"
            >
              <el-image
                :src="
                  img.trim().toLowerCase().startsWith('http')
                    ? img.trim()
                    : settings.imgBaseUrl + img.trim()
                "
                style="
                  max-width: 60px;
                  vertical-align: middle;
                  cursor: pointer;
                  margin-left: 4px;
                "
                :preview-src-list="
                  msg.fileUrl
                    .split(',')
                    .filter(Boolean)
                    .map((i) =>
                      i.trim().toLowerCase().startsWith('http')
                        ? i.trim()
                        : settings.imgBaseUrl + i.trim()
                    )
                "
                :initial-index="idx"
                preview-teleported
              />
            </template>
          </span>
        </el-timeline-item>
      </el-timeline>
    </div>
    <template #footer>
      <el-button
        type="primary"
        @click="handleContactPublisher"
        :disabled="!currentOrder?.publisher?.userId"
        >联系发单者</el-button
      >
      <el-button
        type="primary"
        @click="handleContactTaker"
        :disabled="!currentOrder?.taker?.userId"
        >联系接单者</el-button
      >
      <el-button
        type="danger"
        @click="handleArbitrate"
        :disabled="!currentOrder"
        >仲裁订单</el-button
      >
    </template>
  </el-dialog>
  <el-dialog v-model="arbitrateDialogVisible" title="仲裁订单" width="400px">
    <div style="margin-bottom: 12px">
      <b>订单金额：</b>￥{{ currentOrder?.price || 0 }}<br />
      <b>可用保证金：</b>￥{{
        (currentOrder?.securityDeposit || 0) +
        (currentOrder?.efficiencyDeposit || 0)
      }}
    </div>
    <el-form
      :model="arbitrateForm"
      :rules="arbitrateRules"
      label-width="110px"
      ref="arbitrateFormRef"
    >
      <el-form-item label="订单金额支付" prop="payAmount">
        <el-input-number
          v-model="arbitrateForm.payAmount"
          :min="0"
          :max="currentOrder?.price || 0"
          :step="1"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="保证金支付" prop="depositAmount">
        <el-input-number
          v-model="arbitrateForm.depositAmount"
          :min="0"
          :max="
            (currentOrder?.securityDeposit || 0) +
            (currentOrder?.efficiencyDeposit || 0)
          "
          :step="1"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="说明" prop="remark">
        <el-input v-model="arbitrateForm.remark" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="arbitrateDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitArbitrateWithValidate"
        >提交</el-button
      >
    </template>
  </el-dialog>
  <el-dialog
    v-model="arbitrateSuccessDialogVisible"
    title="仲裁成功"
    width="320px"
    :close-on-click-modal="false"
    :show-close="false"
  >
    <div style="text-align: center; padding: 32px 0">
      <el-icon style="color: #67c23a; font-size: 48px"
        ><circle-check
      /></el-icon>
      <div style="margin-top: 16px; font-size: 18px">仲裁提交成功！</div>
    </div>
    <template #footer>
      <el-button type="primary" @click="handleArbitrateSuccessConfirm"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import {
  getOrderInfoList,
  getOrderDetail,
  getOrderMessages,
  arbitrateOrder,
} from '@/api/order/index'
import {
  ElMessage,
  ElDivider,
  ElTimeline,
  ElTimelineItem,
  ElAvatar,
} from 'element-plus'
import settings from '@/settings'
import { CircleCheck } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()
const managerId = userStore.userId

const searchForm = reactive({ orderNo: '' })
const orderList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const currentOrder = ref(null)
const messageList = ref([])
const loadingDetail = ref(false)

// 仲裁弹窗相关
const arbitrateDialogVisible = ref(false)
const arbitrateForm = reactive({
  payAmount: null,
  depositAmount: null,
  remark: '',
})
const arbitrateRules = {
  payAmount: [
    { required: true, message: '请输入订单金额支付', trigger: 'blur' },
    { validator: validatePayAmount, trigger: 'blur' },
  ],
  depositAmount: [
    { required: true, message: '请输入保证金支付', trigger: 'blur' },
    { validator: validateDepositAmount, trigger: 'blur' },
  ],
  remark: [{ required: true, message: '请输入说明', trigger: 'blur' }],
}
function validatePayAmount(rule, value, callback) {
  const max = Number(currentOrder.value?.price) || 0
  if (value === '' || isNaN(value)) return callback(new Error('请输入有效金额'))
  if (Number(value) > max) return callback(new Error('不能大于订单金额'))
  callback()
}
function validateDepositAmount(rule, value, callback) {
  const max =
    (Number(currentOrder.value?.securityDeposit) || 0) +
    (Number(currentOrder.value?.efficiencyDeposit) || 0)
  if (value === '' || isNaN(value))
    return callback(new Error('请输入有效保证金'))
  if (Number(value) > max) return callback(new Error('不能大于保证金之和'))
  callback()
}
function formatTimeCell(rowOrValue) {
  let value = rowOrValue
  // 兼容 el-table-column 的 formatter 传参
  if (
    typeof rowOrValue === 'object' &&
    rowOrValue !== null &&
    'updatedAt' in rowOrValue
  ) {
    value = rowOrValue.updatedAt
  }
  if (!value) return ''
  let date
  if (typeof value === 'number') {
    date = value > 1e12 ? new Date(value) : new Date(value * 1000)
  } else if (typeof value === 'string' && /^\d+$/.test(value)) {
    const num = Number(value)
    date = num > 1e12 ? new Date(num) : new Date(num * 1000)
  } else {
    date = new Date(value)
  }
  if (isNaN(date.getTime())) return ''
  return date.toLocaleString()
}

function fetchList() {
  getOrderInfoList({
    orderNo: searchForm.orderNo || undefined,
    // 可根据实际业务调整异常订单的status范围
    status: 9,
    managerId: managerId || undefined,
    page: currentPage.value,
    pageSize: pageSize.value,
  }).then((res) => {
    orderList.value = res.data?.list || []
    total.value = Number(res.data?.total) || 0
  })
}

function resetSearch() {
  searchForm.orderNo = ''
  fetchList()
}
function handleCurrentChange(page) {
  currentPage.value = page
  fetchList()
}
function handleSizeChange(size) {
  pageSize.value = size
  fetchList()
}
async function handleManage(row) {
  dialogVisible.value = true
  loadingDetail.value = true
  currentOrder.value = null
  messageList.value = []
  try {
    const [orderRes, msgRes] = await Promise.all([
      getOrderDetail(row.id),
      getOrderMessages(row.id),
    ])
    currentOrder.value = orderRes.data
    // 消息接口返回data为数组
    messageList.value = Array.isArray(msgRes.data)
      ? msgRes.data
      : msgRes.data?.list || []
  } catch (e) {
    ElMessage.error(e?.msg || e?.message || '获取订单信息失败')
  } finally {
    loadingDetail.value = false
  }
}
// 订单消息头像和昵称辅助方法
function getMsgAvatar(msg) {
  if (!currentOrder.value) return ''
  let avatar = ''
  if (msg.senderId === currentOrder.value.publisher?.userId) {
    avatar = currentOrder.value.publisher?.avatar
  } else if (msg.senderId === currentOrder.value.taker?.userId) {
    avatar = currentOrder.value.taker?.avatar
  }
  if (!avatar) return ''
  avatar = avatar.trim()
  return avatar.toLowerCase().startsWith('http')
    ? avatar
    : settings.imgBaseUrl + avatar
}
function getMsgUsername(msg) {
  if (!currentOrder.value) return ''
  if (msg.senderId === currentOrder.value.publisher?.userId) {
    return currentOrder.value.publisher?.username
  }
  if (msg.senderId === currentOrder.value.taker?.userId) {
    return currentOrder.value.taker?.username
  }
  if (msg.senderId === '0') {
    return '系统'
  }
  return msg.senderId
}
// 联系发单者
function handleContactPublisher() {
  if (currentOrder.value?.publisher?.userId) {
    window.open(
      'http://localhost:5173/chat/' + currentOrder.value.publisher.userId,
      '_blank'
    )
  }
}
// 联系接单者
function handleContactTaker() {
  if (currentOrder.value?.taker?.userId) {
    window.open(
      'http://localhost:5173/chat/' + currentOrder.value.taker.userId,
      '_blank'
    )
  }
}
// 处理仲裁订单
function handleArbitrate() {
  arbitrateForm.payAmount = null
  arbitrateForm.depositAmount = null
  arbitrateForm.remark = ''
  arbitrateDialogVisible.value = true
}
const arbitrateFormRef = ref()
async function submitArbitrateWithValidate() {
  await nextTick()
  if (!arbitrateFormRef.value) return
  arbitrateFormRef.value.validate(async (valid) => {
    if (!valid) return
    if (!currentOrder.value) return
    try {
      await arbitrateOrder({
        orderId: currentOrder.value.id,
        payAmount: arbitrateForm.payAmount,
        depositAmount: arbitrateForm.depositAmount,
        remark: arbitrateForm.remark,
      })
      arbitrateDialogVisible.value = false
      arbitrateSuccessDialogVisible.value = true
      // 刷新详情
      handleManage(currentOrder.value)
    } catch (e) {
      ElMessage.error(e?.msg || e?.message || '仲裁提交失败')
    }
  })
}
const arbitrateSuccessDialogVisible = ref(false)

function handleArbitrateSuccessConfirm() {
  arbitrateSuccessDialogVisible.value = false
  dialogVisible.value = false
  fetchList()
}

const orderStatusMap = {
  1: '未接手',
  2: '代练中',
  3: '待验收',
  5: '已完成',
  6: '已撤销',
  7: '撤销中',
  8: '待介入',
  9: '介入中',
  10: '已仲裁',
}

const boostingTypeMap = {
  1: '普通代练',
  2: '陪玩',
  // 可根据实际业务补充
}

onMounted(fetchList)
</script>

<style scoped>
.exception-order-manage-container {
  padding: 20px;
}
</style>
