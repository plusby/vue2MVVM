import { Watcher } from "../observer/watcher.js"
import { patch } from "../vdom/patch.js"

export function lifecycleMixin(Vue){
  // 根据虚拟dom生成真实的dom并且挂载到页面上
  Vue.prototype._update = function (vnode) {
    debugger
    const vm = this
    const prevVnode = vm._vnode
    if (!prevVnode) { // 首次渲染是没有_vnode
      vm.$el = patch(vm.$el, vnode)
    } else { // 数据改变再次渲染，就使用上次的虚拟节点和本次的虚拟节点进行对比
      vm.$el = patch(prevVnode, vnode)
    }
    vm._vnode = vnode
  }
}

export function mountComponent(vm, el){
  callHook(vm, 'beforeMount')
  const updateComponent = () => {
    // _render执行render函数生成虚拟dom
    vm._update(vm._render())
  }
  // 每个组件的挂载都是一个watcher, 当模板中的数据进行获取的时候就会把这个Watcher收集到对应的数据下的dep中
  new Watcher(vm, updateComponent, function a(){
    callHook(vm, 'updated')
  }, { user: false})
  // 模板挂载完成执行mounted钩子
  callHook(vm, 'mounted')
}

// 调用生命周期
export function callHook(vm, hook){
  const handlers = vm.$options[hook]
  if (handlers) {
    for (let i = 0; i < handlers.length; i++) {
      handlers[i].call(vm)
    }
  }
}