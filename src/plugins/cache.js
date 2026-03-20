// sessionStorage 是浏览器提供的内置 Web Storage API 的一部分，用于在会话期间存储数据
const sessionCache = {
  set(key, value) {
    if (!sessionStorage) {
      return
    }
    if (key != null && value != null) {
      sessionStorage.setItem(key, value)
    }
  },
  get(key) {
    if (!sessionStorage) {
      return null
    }
    if (key == null) {
      return null
    }
    return sessionStorage.getItem(key)
  },
  setJSON(key, jsonValue) {
    if (jsonValue != null) {
      this.set(key, JSON.stringify(jsonValue))
    }
  },
  getJSON(key) {
    const value = this.get(key)
    if (value != null) {
      return JSON.parse(value)
    }
  },
  remove(key) {
    sessionStorage.removeItem(key)
  },
}
// localStorage 是浏览器提供的内置 Web Storage API 的一部分，用于在会话期间存储数据
const localCache = {
  set(key, value) {
    if (!localStorage) {
      return
    }
    if (key != null && value != null) {
      localStorage.setItem(key, value)
    }
  },
  get(key) {
    if (!localStorage) {
      return null
    }
    if (key == null) {
      return null
    }
    return localStorage.getItem(key)
  },
  setJSON(key, jsonValue) {
    if (jsonValue != null) {
      this.set(key, JSON.stringify(jsonValue))
    }
  },
  getJSON(key) {
    const value = this.get(key)
    if (value != null) {
      return JSON.parse(value)
    }
  },
  remove(key) {
    localStorage.removeItem(key)
  },
}

export default {
  /**
   * 会话级缓存
   */
  session: sessionCache,
  /**
   * 本地缓存
   */
  local: localCache,
}
// 1. 简要解释内置对象
// 除了 sessionStorage 和 localStorage，浏览器还提供了其他一些内置对象和 API，用于存储数据、操作文档、处理网络请求等。以下是常见的几种：

// 2. 常见的浏览器内置对象
// 1. window
// 描述：全局对象，表示浏览器窗口或标签页。
// 常用属性和方法：
// window.location：获取或设置当前页面的 URL。
// window.alert()：显示警告框。
// window.prompt()：提示用户输入。
// window.confirm()：显示确认对话框。
// 2. document
// 描述：表示 HTML 文档的对象，用于操作 DOM。
// 常用属性和方法：
// document.getElementById()：通过 ID 获取元素。
// document.querySelector()：通过 CSS 选择器获取第一个匹配的元素。
// document.createElement()：创建新的 DOM 元素。
// document.addEventListener()：添加事件监听器。
// 3. navigator
// 描述：包含有关浏览器的信息。
// 常用属性和方法：
// navigator.userAgent：获取浏览器的用户代理字符串。
// navigator.language：获取浏览器的语言设置。
// navigator.onLine：检查浏览器是否在线。
// 4. history
// 描述：用于操作浏览器的历史记录。
// 常用属性和方法：
// history.back()：返回上一页。
// history.forward()：前进到下一页。
// history.pushState()：向历史记录栈中添加新状态。
// 5. indexedDB
// 描述：提供一种在客户端存储大量结构化数据的方式。
// 常用属性和方法：
// indexedDB.open()：打开数据库连接。
// IDBObjectStore：用于存储和检索数据。
// IDBTransaction：用于执行事务。
// 6. fetch
// 描述：用于发起网络请求，替代了传统的 XMLHttpRequest。
// 常用属性和方法：
// fetch(url, options)：发起 HTTP 请求。
// .then() 和 .catch()：处理响应和错误。
// 7. URLSearchParams
// 描述：用于处理 URL 查询参数。
// 常用属性和方法：
// new URLSearchParams(queryString)：创建一个新的 URLSearchParams 对象。
// .get()：获取指定参数的值。
// .set()：设置指定参数的值。
