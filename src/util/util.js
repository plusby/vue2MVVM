
export function proxy (vm, key, val) {
  Object.defineProperty(vm, val, {
    get(){
      return vm[key][val]
    },
    set(value) {
      vm[key][val] = value
    }
  })
}

export function def (data, key, value) {
  Object.defineProperty(data, key, {
    enumerable: false, // 不可枚举 不能被遍历到
    configurable: false, // 不可配置 不可以被修改
    value: value
  })
}

// 判断是否是原生标签
export const isReservedTag = makeMap('a,div,img,image,text,span,p,button,input,textarea,ul,li')

export function makeMap (str) {
  const mapping = {}
  const list = str.split(',')
  for (let i = 0; i < list.length; i++) {
    mapping[list[i]] = true
  }
  return (key) => {
    return mapping[key]
  }
}