import { arrayMethods } from "./array.js"
import { def } from '../util/util.js'
import { Dep } from "./dep.js"


class Observer {
  constructor (value) {
    // 给当前对象创建dep,通过数组的方法修改数据的时候更能获取到当前数组的依赖
    this.dep = new Dep()
    // 给当前对象添加一个属性__ob__属性标志是响应式的
    // 不能直接value.__ob__ = this 会造成死循环，因为this也是对象，this下面的_data下的属性有__ob__\
    // 因此这里要把__ob__设置为不可枚举的
    def(value, '__ob__', this)
    // 是数组
    if (Array.isArray(value)) {
      value.__proto__ = arrayMethods
      this.observerArray(value)
    } else { // 是对象 
      this.walk(value)
    }
  }
  walk (data) {
    const keys = Object.keys(data)
    keys.forEach(key => {
      defineReactive(data, key, data[key])
    })
  }
  // 给数组中的每个值设置响应式
  observerArray (data) {
    for (let i = 0, l = data.length; i < l; i++) {
      observer(data[i])
    }
  }
}
// 给属性添加响应
function defineReactive(data,key,value){
  if ([...arguments].length <= 2) {
    value = data[key]
  }
  // 每个属性都有一个dep用于收集Watcher
  const dep = new Dep()
  // 获取到值的Observer实例
  const childOb = observer(value)
  Object.defineProperty(data, key, {
    get () {
      // 如果有watcher，就进行收集
      if (Dep.target) {
        dep.depend()
        /**
         * // 如果当前value是一个数组，那么在操作数组的方法的时候，怎么能够获取到当前的dep进行更新？那只能给数组对象上添加一个dep,
         * 并且在此进行依赖收集，在方法中获取到Dep进行更新
         */
        if (childOb) { 
          childOb.dep.depend()
        }
      }
      return value
    },
    set (newValue) {
      if (newValue === value) {
        return
      }
      // 通知依赖更新
      dep.notify()
      // 新值进行递归设置响应
      observer(newValue)
      value = newValue
    }
  })
}

export function observer(data){
  
  // 不是对象直接返回
  if (typeof data !== 'object' || data === null) {
    return
  }
  // 已经属于响应式了直接返回
  if (data.__ob__) {
    return data.__ob__
  }
  return new Observer(data)
}