import { nextTick } from "../util/next-tick.js"
import { isReservedTag } from "../util/util.js"
import { Vnode } from "../vdom/vnode.js"

export function renderMixin (Vue) {
  // 创建元素
  Vue.prototype._c = function () {
    const vm = this
    return createElement(vm, ...arguments)
  }

  // 字符串
  Vue.prototype._s = function (val) {
    return val === null ? '' : (typeof val === 'object' ? JSON.stringify(val) : val)
  }

  // 创建文本
  Vue.prototype._v = function (text) {
    return createTextVnode(text)
  }

  Vue.prototype.$nextTick = function (fn) {
    return nextTick(fn, this)
  }

// 
/**
 * 根据render函数返回对应的vnode\
 * 
 * @returns 
 */
  Vue.prototype._render = function () {
    const vm = this
    const render = vm.$options.render
    let vnode = render.call(vm)
    // console.log('vnode', vnode)
    return vnode
  }
}

function createComponent(vm, tag, data, key, children, Ctor){
  const baseCtor = vm.$options._base
  if (typeof Ctor === 'object') { // 如果是对象表示是局部组件
    Ctor = baseCtor.extend(Ctor)
  }
  data.hook = {
    init(vnode){
      // 执行子组件的构造函数
      const child = vnode.componentInstance = new Ctor({})
      console.log('child', child)
      debugger
      child.$mount() // 子组件进行挂载
    }
  }
  return Vnode(`vue-component-${Ctor.cid}`,data,data.key,undefined,undefined,{Ctor,children})
}

function createElement (vm, tag, data={},...children) {
  // 是否是原始标签
  if (isReservedTag(tag)) {
    return Vnode(tag,data,data.key,children) 
  } else { // 组件  
    // 获取到组件的构造函数
    let Ctor = vm.$options.components[tag]
    // 创建组件的虚拟节点
    return createComponent(vm, tag, data, data.key, children, Ctor)
  }
  
}

function createTextVnode(text){
  return Vnode(undefined,undefined,undefined,undefined,text)
}