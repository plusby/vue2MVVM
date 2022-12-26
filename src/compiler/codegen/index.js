
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

function genProps (attrs) {
  let str = ''
  for (let i =  0, l = attrs.length; i < l; i++) {
    let attr = attrs[i]
    if (attr.name === 'style') {
      let obj = {}
      // ('attr', attr)
      if (typeof attr.value === 'string') {
        attr.value.split(';').forEach(element => {
          let [key,value] = element.split(':')
          obj[key] = value
        })
      }
      attr.value = obj
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0,-1)}}`
}

function genChildren(el){
  const children = el.children
  if (children){ // 把子元素通过逗号拼接
    return children.map(item => {
      return gen(item)
    }).join(',')
  }
}

function gen (node) {
  if (node.type === 1) {
    return generate(node)
  } else {
    const text = node.text
    // 普通文本 没有{{}}包裹的文本
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`
    } else {
      let tokens = []
      let lastIndex = defaultTagRE.lastIndex = 0
      let match,index;
      // 匹配大括号
      while(match = defaultTagRE.exec(text)){
        // 保存匹配到的索引
        index = match.index
        // 如果索引大于上次的匹配的索引，表示在大括号之前有文本
        if (index > lastIndex) {
          // 保存普通文本
          tokens.push(JSON.stringify(text.slice(lastIndex,index)))
        }
        // 保存大括号中的变量用_s()包裹
        tokens.push(`_s(${match[1].trim()})`)
        // 保存下次开始匹配的位置
        lastIndex = index + match[0].length
      }
      // 还有剩余的普通文本
      if (lastIndex< text.lenght) {
        tokens.push(JSON.stringify(text.slice(lastIndex)))
      }
      // 普通文本和大括号中的变量通过+拼接
      return `_v(${tokens.join('+')})`
    }
    
    
  }
}

/**
 * <div id="app" style="color:red">表格<p>姓名：{{name}}</p></div>
 * _c(标签名,标签属性,_v(文本),_c(子标签))
 *  _c(div, {id:"app"，style: {color: 'red'}}},_v("表格"),_c(p, undefined,_v("姓名："+_s(name))))
 * @param {*} ast 
 * @param {*} options 
 */
export function generate (ast, options) {
  const children = genChildren(ast)
  let code = `_c('${ast.tag}', ${
    ast.attrs.length ? genProps(ast.attrs) : 'undefined'
  }${
    children ? `,${ children }` : ''
  })`
  return code
}