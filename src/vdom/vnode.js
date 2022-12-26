export function Vnode (tag,
  data,
  key,
  children,
  text,
  componentOptions
  ) {
  return {
    tag,
    data,
    key,
    children,
    text,
    componentOptions, // 组件的构造函数和内部元素
  }
}