import { popTarget, pushTarget } from "./dep.js"
import { queueWatcher } from "./scheduler.js"
let id = 1
export class Watcher {
  constructor(vm, exporOrFn, cb, options){
    this.vm = vm 
    this.exporOrFn = exporOrFn
    this.cb = cb
    this.lazy = options.lazy
    this.dirty = this.lazy // 用来控制computed中的缓存
    // 防止收集重复的dep
    this.depsId = new Set()
    this.id = id++
    // 收集dep
    this.deps = []
    this.user = options.user
    if (typeof exporOrFn === 'function') {
      this.getter = exporOrFn
    } else { // 是字符串路径
      this.getter = getPath(exporOrFn)
    }
    // ('999options', options, this.getter)
    this.value = this.get()
  }
  // 给当前的watcher中添加dep
  addDep (dep) {
    // 防止重复添加一个数据的dep,因为首次读取的时候就会添加，当修改完数据之后会更新视图会再次执行数据的getter方法进行添加依赖；
    if (!this.depsId.has(dep.id)) {
      this.depsId.add(dep.id)
      this.deps.push(dep)
      // 再把当前的Watcher存入到dep中
      dep.addSub(this)
    }
  }

  run () {
    const oldValue = this.value
    this.value = this.get()
    if (this.user) {
      this.cb && this.cb(this.value, oldValue)
    }
  }

  get(){
    const vm = this.vm
    
    pushTarget(this)
    // getter就是监听的属性或者函数(计算属性的函数，渲染视图的函数，用户监听的属性)
    let result = this.getter.call(vm, vm)
    popTarget()
    return result
  }
  update () {
    debugger
    if (this.lazy) { // 是计算属性 并且相关数据改变了就把dirty设置为true,再次获取计算属性的时候获取最新值而不是从缓存中获取
      this.dirty = true
    } else {
      // 同步更新，每次修改数据都会执行一次更新
      // this.get()
      // 通过异步进行更新watcher 进行优化 多次修改数据只更新一次，多次修改视图中的数据，监听视图的watcher的函数只更新一次
      queueWatcher(this)
    }
  }
  // 用于获取到值
  evaluate () {
    this.value = this.get()
    // 标记为false 如果计算属性中的相关数据么有变化就从缓存中获取 变化了会把dirty改为true
    this.dirty = false
  }
  depend () {
    // 找到当前watcher中的所有的dep.把当前的watcher添加到当前watcher中的所有的dep中
    let i = this.deps.length
    while(i--){
      this.deps[i].depend()
    }
  }
}

function getPath (path) {
  const segments = path.split('.')
  return function (obj) {
    
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}