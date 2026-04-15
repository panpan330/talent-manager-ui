<script setup>
import request from '../utils/request'
import { ElMessage } from 'element-plus' // Element Plus 的精美消息提示
import { ref, watch, computed } from 'vue'
// 引入刚刚放入 components 的动画组件
import AnimatedCharacters from '../components/AnimatedCharacters.vue'

import { useRouter } from 'vue-router'
const router = useRouter()

// ==== 表单数据绑定 ====
const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)

// ==== 动画交互状态 ====
const focusedField = ref('none') // 当前聚焦的输入框 ('none' | 'username' | 'password')
const isLoginError = ref(false)  // 是否触发错误震动动画
const isTyping = ref(false)      // 是否正在输入
const formBanner = ref('')       // 顶部的错误提示文字
let errorTimer = null

// 动画组件的配置参数（保持默认最佳手感）
const characterConfig = {
  scale: 0.88,
  mouseSensitivityX: 20,
  mouseSensitivityY: 30,
  pupilFollowFactor: 0.35,
}

// ==== 交互事件处理 ====
function onUsernameFocus() { focusedField.value = 'username'; isTyping.value = true }
function onUsernameBlur() { focusedField.value = 'none'; isTyping.value = false }
function onPasswordFocus() { focusedField.value = 'password'; isTyping.value = true }
function onPasswordBlur() { focusedField.value = 'none'; isTyping.value = false }
function togglePassword() { showPassword.value = !showPassword.value }

// ==== 登录逻辑 ====
function clearFormErrors() {
  formBanner.value = ''
}

function triggerError() {
  isLoginError.value = true
  if (errorTimer) window.clearTimeout(errorTimer)
  errorTimer = window.setTimeout(() => { isLoginError.value = false }, 2200)
}

// 注意前面加了 async 关键字
async function handleLogin() {
  clearFormErrors()

  if (!username.value.trim() || !password.value) {
    formBanner.value = '请填写账号和密码后再试。'
    triggerError()
    return
  }
  
  try {
    // 🔥 真正发起后端调用！
    const res = await request.post('/sys-user/login', {
      username: username.value,
      password: password.value
    })

    if (res.code === 200) {
      // 登录成功！
      ElMessage.success('登录成功！欢迎回来。')
      
      // 极其关键：把后端发给我们的 JWT 通行证（Token）存到浏览器的本地仓库里
      localStorage.setItem('token', res.data)
      
      router.push('/')
      
    } else {
      // 密码错误等业务报错（后端返回 500 等）
      formBanner.value = res.msg || '登录失败，请检查账号密码'
      triggerError()
    }
  } catch (error) {
    formBanner.value = '网络请求失败，请检查Java后端是否已启动'
    triggerError()
  }
}

// 当用户修改输入时，清除错误状态
watch([username, password], () => {
  clearFormErrors()
  if (isLoginError.value) {
    isLoginError.value = false
    if (errorTimer) { window.clearTimeout(errorTimer); errorTimer = null }
  }
})
</script>

<template>
  <div class="login-page">
    <div class="login-shell">
      <section class="left-panel">
        <AnimatedCharacters
          :config="characterConfig"
          :focused-field="focusedField === 'username' ? 'email' : focusedField" 
          :is-password-visible="showPassword"
          :password-length="password.length"
          :is-login-error="isLoginError"
          :is-typing="isTyping"
        />
      </section>

      <section class="right-panel">
        <div class="form-card">
          <div class="form-center">
            
            <div v-if="formBanner" class="form-banner" role="alert">
              {{ formBanner }}
            </div>

            <h1>交叉人才管理系统</h1>
            <p class="subtitle">请输入您的管理员凭证</p>

            <label class="field-label">系统账号</label>
            <div class="input-wrap" :class="{ focused: focusedField === 'username' }">
              <input
                v-model="username"
                type="text"
                placeholder="请输入账号 (如: admin)"
                autocomplete="username"
                @focus="onUsernameFocus"
                @blur="onUsernameBlur"
              />
            </div>

            <label class="field-label">登录密码</label>
            <div class="input-wrap" :class="{ focused: focusedField === 'password' }">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码 (如: 123456)"
                autocomplete="current-password"
                maxlength="30"
                @focus="onPasswordFocus"
                @blur="onPasswordBlur"
              />
              <button class="eye-btn" type="button" tabindex="-1" @click="togglePassword">
                <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>

            <div class="action-row">
              <label class="checkbox-wrap">
                <input v-model="rememberMe" type="checkbox" />
                <span class="checkmark" :class="{ checked: rememberMe }">
                  <svg v-if="rememberMe" width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
                <span>保持登录状态</span>
              </label>
              <a href="javascript:void(0)" class="forgot-link">忘记密码?</a>
            </div>

            <button class="login-btn" type="button" @click="handleLogin">进入系统</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* ====================
   全套布局与样式 
   ==================== */
.login-page {
  min-height: 100vh;
  background: #f0f4f8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 24px 16px;
}

.login-shell {
  width: 100%;
  max-width: 1100px; /* 适当调小了一点宽度，显得更精致 */
  height: 650px;     /* 适配表单高度 */
  border-radius: 28px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  background: #e9e9e9;
  box-shadow: 0 20px 80px rgba(0,0,0,0.3);
  flex-shrink: 0;
}

.left-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 12px 48px;
  overflow: hidden;
  background: #f4f4f5; /* 左侧浅灰背景底色 */
}

.right-panel {
  display: flex;
  align-items: stretch;
  padding: 8px 8px 8px 0;
  overflow: hidden;
}

.form-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 28px;
  padding: 40px 56px 20px;
  position: relative;
}

.form-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.form-banner {
  width: 100%;
  max-width: 380px;
  padding: 10px 14px;
  margin-bottom: 20px;
  border-radius: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

h1 { font-size: 26px; font-weight: 700; color: #1d2231; margin-top: 4px; }
.subtitle { color: #737373; font-size: 14px; margin: 8px 0 30px; }

.field-label { display: block; width: 100%; max-width: 380px; font-size: 13px; font-weight: 600; color: #111; margin-bottom: 6px; }

.input-wrap {
  width: 100%; max-width: 380px;
  display: flex; align-items: center;
  border: 1px solid #d7d9e0; border-radius: 12px;
  background: #fff; height: 48px; padding: 0 16px;
  margin-bottom: 20px; transition: box-shadow 0.25s, border-color 0.25s;
}

.input-wrap.focused { box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-color: #5868ff; }

.input-wrap input { flex: 1; border: none; outline: none; background: transparent; font-size: 14px; color: #1d2231; height: 100%; }
.input-wrap input::placeholder { color: #aaa; }

.eye-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; color: #888; padding: 4px; }
.eye-btn:hover { color: #333; }

.action-row { width: 100%; max-width: 380px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; font-size: 13px; }
.checkbox-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; color: #555; font-weight: 500; user-select: none; }
.checkbox-wrap input { display: none; }
.checkmark { width: 18px; height: 18px; border: 1.5px solid #171717; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
.checkmark.checked { background: #171717; }
.forgot-link { color: #5868ff; text-decoration: none; font-weight: 600; }
.forgot-link:hover { color: #3a4ae0; }

.login-btn { 
  width: 100%; max-width: 380px; height: 50px; 
  border: none; border-radius: 12px; 
  background: #171717; color: #fff; 
  font-size: 16px; font-weight: 600; 
  cursor: pointer; transition: transform 0.2s, background 0.2s; 
}
.login-btn:hover { background: #333; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.2); }

@media (max-width: 980px) {
  .login-shell { grid-template-columns: 1fr; height: auto; }
  .left-panel { min-height: 400px; }
}
@media (max-width: 640px) {
  .left-panel { display: none; }
}
</style>