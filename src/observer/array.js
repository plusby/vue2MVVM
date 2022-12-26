
// 获取到数组上的原型
const oldArrayPrototypeMethods = Array.prototype

// 创建一个空对象，继承数组的原型
export let arrayMethods = Object.create(oldArrayPrototypeMethods)

// 重写的七种方法 修改原数组的只有这七种方法
const arrays = [
  'shift',
  'unshift',
  'pop',
  'push',
  'splice',
  'reverse',
  'sort',
]

arrays.forEach(method => {
  arrayMethods[method] = function (...args) {
    (this)
    const result = oldArrayPrototypeMethods[method].apply(this, args)
    let insert
    const ob = this.__ob__
    switch (method) {
      case 'push':
      case 'unshift':
        insert = args
        break
      case 'splice':
        insert = args.slice(2) // [].splice(1,1, {a:2})
        break
      default:
        break;
    }
    insert && ob.observerArray(insert)
    ob.dep.notify()
    return result
  }
})