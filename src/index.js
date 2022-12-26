import { compileToFunction } from "./compiler/index.js";
import { createElm, patch} from './vdom/patch.js'
import { initGlobalApi } from "./global-api/index.js";
import { initMixin } from "./init";
import { lifecycleMixin } from "./instance/lifecycle.js"
import { renderMixin } from "./instance/render.js";
import { stateMixin } from "./state.js";

/**
 * new Vue()
 * 为什么不用class类来实现，因为类是一个整体，使用类函数，可以不是一个整体，能够
 * 方便的进行拆解和扩展
 * 
 * vue不是一个标准的mvvm框架
 * 因为它可以操作dom,有ref可以获取到dom
 * 而mvvm是数据变化更新视图，视图变化影响数据，不能跳过数据直接更新视图
 * 
 * Vue2在给属性设置监听的时候，是通过递归的形式，因此性能不如vue3的proxy
 * 
 * 为什么对于数组不进行递归设置每个索引的监听，为了提高性能，并且一般很少通过小标修改数组中的某个值
 * 
 * vue中每个对象或数组类型的数据都是一个Observer，通过observer设置监听
 * 
 * 模板编译
 *  1. 默认找render方法 没有render就找template属性 没有就找el属性中的内容
 *  基本流程： 字符串模板解析成ast树， ast树转成render函数，render函数转成虚拟dom
 * 
 * vue渲染流程： 初始化数据 -> 进行模板编译 -> 生成ast抽象语法树 ->生成render函数 -> 生成虚拟dom -> 生成真实dom插入到页面中
 * 
 * 拆分组件的好处？
 *  1. 实现复用  2.方便维护  3. 组件拆分的越细，在数据变化的时候只更新这一个小组件，而不是一个大组件
 * 
 * 组件的渲染流程
 *  1. 调用Vue.component
 *  2. 内部调用的是Vue.extend生成一个子类继承于父类
 *  3. 调用子类的时候，子类内部会调用父类的_init方法，再$mount即可
 *  4. 组件的初始化就是new这个组件的构造函数，并且调用$mount方法
 *  5. 创建虚拟节点，根据标签生成组件的虚拟节点
 * 
 */


function Vue(options){
  this._init(options)
}
// 写成一个个插件进行原型的扩展
// 初始化数据
initMixin(Vue)
// 组件的生命周期
lifecycleMixin(Vue)
// 执行render函数生成虚拟dom
renderMixin(Vue)

initGlobalApi(Vue)

stateMixin(Vue)

export default Vue;

// 测试diff
// const v1 = new Vue({data: { name: 'v11'}})
// const render1 = compileToFunction(`<div id='a1' key='1' style="color:red;background:#000;">
//   <p key='2'>1</p>
//   <p key='3' style="color:red">2</p>
//   <p key='4'>3</p>
// </div>`).render
// const vnode1 = render1.call(v1)
// document.body.appendChild(createElm(vnode1))

// const v2 = new Vue({data: { name: 'v22'}})
// const render2 = compileToFunction(`<div id='a2' key='1' style="color:green;">
//   <p key='5'>5</p>
//   <p key='2'>1</p>
//   <p key='6'>6</p>
//   <p key='3' style="color:red">2</p>
//   <p key='7'>7</p>
// </div>`).render
// const vnode2 = render2.call(v2)

// setTimeout(() => {
//   // ('vnode1, vnode2', vnode1, vnode2)
//   patch(vnode1, vnode2)
// },2000)
