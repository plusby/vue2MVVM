import { Dep } from "./observer/dep.js"
import { observer } from "./observer/index.js"
import { Watcher } from "./observer/watcher.js"
import { proxy } from "./util/util.js"

export function initSate (vm) {
  
  const opts = vm.$options
  if (opts.props) {
    initProps(vm)
  }
  if (opts.methods) {
    initMethods(vm)
  }
  if (opts.data) {
    initData(vm)
  }
  if (opts.computed) {
    initComputed(vm)
  }
  if (opts.watch) {
    initWatch(vm, opts.watch)
  }
}

function initProps(){}
function initMethods(){}
function initData(vm){
  let data = vm.$options.data
  vm._data = data = typeof data === 'function' ? data.call(vm) : data
  // 给vue实例上添加属性
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      proxy(vm, '_data', key)
    }
  }
  observer(data)

}
/**
 * 计算属性
 * 每个计算属性的值都会被Watcher进行监听
 * 再把Watcher实例缓存到当前实例的一个属性上
 * 每个计算属性都会通过Object.defineProperty被添加到当前实例上，在获取计算属性的时候，会执行Getter方法，
 * getter内部首先从缓存中获取，获取到之后通过watcher上的dirty判断是否改变，改变了就执行
 * watcher的方法获取到新值；否则直接返回值
 * 
 * 计算属性中使用到的数据需要收集当前计算属性的watcher
 * 和渲染视图的watcher,
 * 
 * 计算属性的watcher是在模板编译之前初始化的，已经在数据中进行了收集
 * 再编译模板的执行render函数的时候，会进行读取页面中的计算属性，此时已经
 * 缓存了计算属性的watcher，并且数据没有变化，因此不执行watcher中的get,
 * 因此不会收集到渲染视图的watcher;
 * 
 * 在渲染视图中读取计算属性的时候，当前的watcher就是渲染wathcer,此时的Dep.target就是渲染的Watcher,
 * 调用当前计算属性的watcher的depend进行收集渲染watcher,(计算属性中的watcher中的deps都是属性中使用到
 * 的数据),depend中调用计算属性的watcher中的deps进行收集渲染watcher,这样在数据变化的时候就能执行渲染watcher中的update方法，
 * 再次使用计算属性的时候，就会执行渲染watcher中的get获取到新值更新到视图上
 * 
 * 
 * @param {*} vm 
 */
function initComputed(vm){
  const computed = vm.$options.computed
  // 缓存wathcer
  const watchers = vm._computedWatchers = {}
  // 遍历计算属性
  for (const key in computed) {
    if (Object.hasOwnProperty.call(computed, key)) {
      const userDef = computed[key];
      const getter = typeof userDef === 'function' ? userDef : userDef.get;
      // 每个计算属性都是Watcher
      watchers[key] = new Watcher(vm, getter, () => {}, { lazy: true })
      // 把计算属性添加到当前实例上
      defineComputed(vm, key, userDef)
      
    }
  }
}


function defineComputed (target, key, userDef) {
  const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: () => {},
    set: () => {},
  }
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = createComputedGetter(key)
  } else {
    sharedPropertyDefinition.get = createComputedGetter(key)
    sharedPropertyDefinition.set = userDef.set
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
function initWatch(vm, watch){
  
  for (const key in watch) {
    const handler = watch[key]
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

function createWatcher (vm, expOrFn, handler, options = {}) {
  // 是字符串就从实例上获取这个方法
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  // 是对象
  if (typeof handler === 'object') {
    options = handler
    handler = handler.handler
  }
  return vm.$watch(expOrFn, handler, options)
}

function createComputedGetter (key) {
  return function () {
    // 从缓存中获取
    
    const watcher = this._computedWatchers[key]
    if (watcher) {
      // 如果相关数据改变，那么执行watcher重新获取最新数据
      if (watcher.dirty) {
        watcher.evaluate()
      }
      ('Dep.target', Dep.target)
      // 如果有依赖 把渲染的watcher进行添加到计算属性的相关数据的依赖中
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    } 
  }
}


export function stateMixin (Vue) {
  Vue.prototype.$watch = function (expOrFn, cb, options) {
    options.user = true
    // // ('options', this, expOrFn, cb, options)
    const watcher = new Watcher(this, expOrFn, cb, options)
    // 如果是立即执行就执行回调
    if (options.immediate) {
      cb && cb(watcher.value)
    }
  }
}