import { mergeOptions } from "../util/options.js";
import { initExtend } from "./extend.js";

 // 全局方法
export function initGlobalApi (Vue) {
  Vue.options = {}
  // mixin
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin)
  }
  // extend方法
  initExtend(Vue)
  Vue.options._base = Vue
  // 存储全局中所有的组件
  Vue.options.components = {}
  // 全局的component
  Vue.component = function (id, definition) {
    definition.name = definition.name || id
    // 创建子组件的类，并且继承自父组件
    definition = this.options._base.extend(definition)
    // 进行记录
    Vue.options.components[id] = definition
  }
}