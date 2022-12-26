
/**
 * dep和watcher是多对多的关系
 * 一个Dep中可以有多个watcher,当前组件的watcher,和用户自定义的watcher
 * 一个watcher中可以有多个dep,当前组件中定义了很多数据，每个响应式的数据都是一个dep
 * 
 * 为什么dep中要收集watcher，而watcher中需要收集dep?
 * dep中收集watcher是因为数据变化的时候能够通过当前数据下的dep找到那些使用了这条数据的watcher，并且通知它们进行更新
 * watcher中收集dep,因为方便获取到当前watcher中使用了哪些dep,便于获取到这些dep,从而给这些dep中添加新的watcher(给计算属性的watcher中的dep添加渲染watcher)
 */
let id = 0
export class Dep {
  constructor () {
    this.subs = []
    this.id = id++
  }
  // 把当前dep存入到watcher中，watcher和dep是多对多
  depend () {
    if (Dep.target) {
      // 实现dep中存储watcher和watcher中存储dep
      Dep.target.addDep(this)
    }
  }
  // 当前的dep中进行依赖收集(把watcher添加到dep中)
  addSub (sub) {
    this.subs.push(sub)
  }
  notify () {
    for(let i = 0; i < this.subs.length; i++){
      this.subs[i].update()
    }
  }
}
Dep.target = null
// 存储依赖的数据 比如页面中使用了计算属性，计算属性中的数据下的dep需要存储计算属性的watcher和渲染视图的e
// wathcer,页面首次挂载的时候，会生成渲染wathcer,然后再执行render函数，函数内部会读取计算属性，此时的Dep.target就是
// 计算属性的watcher,如果不存在直接清空，那么就无法获取到渲染的Watcher,因此需要数据一个数组进行存储渲染视图的watcher
const stack = []
export function pushTarget (watcher) {
  Dep.target = watcher
  stack.push(watcher)
}
export function popTarget () {
  // Dep.target = null
  stack.pop() // 删除掉当前的依赖
  // // 获取上个依赖
  Dep.target = stack[stack.length - 1]
}