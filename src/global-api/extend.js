import { mergeOptions } from "../util/options"


export function initExtend (Vue) {
  let cid = 0
  Vue.extend = function (extendOptions) {
    const Super = this
    const name = extendOptions.name || Super.options.name
    // 创建子类
    const Sub = function (options){
      this._init(options)
    }
    Sub.cid = cid++
    // 实现继承
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub 
    // ('Super.options', Super)
    // 合并属性
    Sub.options = mergeOptions(Super.options, extendOptions)
    Sub.components = Super.components
    return Sub
  }
}