<template>
  <router-view></router-view>
</template>

<style>
/* 1. 终极清除白边魔法 */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 2. 强制 html 和 body 铺满全屏，且隐藏多余的页面滚动条 */
html, body, #app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden; /* 砍掉外层滚动条 */
}

/* 3. 字体优化，让文字更清晰 */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
</style>