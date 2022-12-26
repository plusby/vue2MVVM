import { compileToFunction } from "./compiler/index.js"
import { callHook, mountComponent } from "./instance/lifecycle.js"
import { initSate } from "./state"
import { mergeOptions } from "./util/options.js"

export function initMixin(Vue){
  Vue.prototype._init = function (options) {
    const vm = this
    // 合并当前组件和全局的options
    vm.$options = mergeOptions(vm.constructor.options, options)
    callHook(vm, 'breforeCreate')
    // 初始化注入
    // 初始化状态
    // vue中的状态有 data props computed watch methods
    initSate(vm)
    // 初始化provide
    debugger
    callHook(vm, 'created')
    // 进行挂载
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
  /**
   * 获取到字符串模板，进行模板编译生成Ast树，把ast树转成Render函数，执行
   * @param {*} el 
   */
  Vue.prototype.$mount = function (el) {
    const vm = this
    const options = vm.$options
    el = document.querySelector(el)
    vm.$el = el
    // 没有render
    if (!options.render) {
      // 获取template
      let template = options.template
      // template不存在 获取el元素内容
      if (!template) {
        template = el.outerHTML
      }
      // 进行解析成render函数
      const { render } = compileToFunction(template, options)
      options.render = render
    }
    mountComponent(vm)
  }
}