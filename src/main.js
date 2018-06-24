import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
require('@/bundle');

Vue.config.productionTip = false
window.onload = function() {
  window.fetchAndInstantiate('ncmb.wasm')
  .then(mod => {
    const exports = mod.exports;
    window.to_sign = s => {
      let outptr = exports.to_sign(window.newString(exports, s));
      return window.copyCStr(exports, outptr);
    };
    new Vue({
      render: h => h(App)
    }).$mount('#app');
  });
};

