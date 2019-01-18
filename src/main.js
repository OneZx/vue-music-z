import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import VueLazyload from 'vue-lazyload'

import fastclick from 'fastclick'

import './common/stylus/index.styl'

// 移动端300ms延迟
fastclick.attach(document.body)
// 懒加载
// or with options
// Vue.use(VueLazyload, {
//     preLoad: 1.3,
//     error: 'dist/error.png',
//     loading: 'dist/loading.gif',
//     attempt: 1
// })
Vue.use(VueLazyload, {
    loading: require('common/image/default.png')
})

Vue.config.productionTip = false
/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    render: h => h(App)
})
