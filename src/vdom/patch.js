
// 把虚拟节点转成真实节点
export function patch (oldVnode, vnode) {
  // 如果是组件
  if (!oldVnode) {
    return createElm(vnode)
  }
  // 如果是真实元素节点
  if (oldVnode.nodeType === 1) {
    // 创建新节点
    const el = createElm(vnode)
    // 获取到老节点的父节点
    const parentElm = oldVnode.parentNode
    // 把新节点插入到父级节点中
    parentElm.insertBefore(el, oldVnode.nextSibling)
    // 删除旧节点
    parentElm.removeChild(oldVnode)
    return el
  } else {
    // 如果两个标签不一样直接用新的替换老的
    if(oldVnode.tag !== vnode.tag){
      return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el)
    }
    // 不是元素，并且没有tag 那就是文本节点
    if (!oldVnode.tag) {
      // 如果文本不一样直接把新的更新到旧的上面
      if (oldVnode.text !== vnode.text) {
        return oldVnode.el.textContent = vnode.text
      }
    }

    // 都是虚拟节点 那就对比属性和子节点
    const el = vnode.el = oldVnode.el
    // 对比属性 用新的属性更新到老的上
    updateProps(vnode, oldVnode.data)
    // 子节点比较 老的有新的没有删除老的  老的没有新的有添加到老的中 老的和新的都有
    const oldChild = oldVnode.children || []
    const newChild = vnode.children || []
    // 新老都有
    if (oldChild.length > 0 && newChild.length > 0) {
      updateChildren(oldChild, newChild, el)
    } else if (oldChild.length > 0) { // 老的有新的没有删除老的
      el.innerHtml = ''
    } else if (newChild.length > 0) { // 新的有老的没有 添加
      let index = newChild.length
      while(index--){
        el.appendChild(createElm(newChild[index]))
      }
    }
    return el
  }
  
}

// 更新新旧节点
function updateChildren (oldChild, newChild, parentEl) {
  // 定义新前新后指针和虚拟节点 旧前旧后指针和虚拟节点
  let newStartIndex = 0
  let newEndIndex = newChild.length - 1
  let newStartVnode = newChild[newStartIndex]
  let newEndVnode = newChild[newEndIndex]
  let oldStartIndex = 0
  let oldEndIndex = oldChild.length - 1
  let oldStartVnode = oldChild[oldStartIndex]
  let oldEndVnode = oldChild[oldEndIndex]

  while (newStartIndex <= newEndIndex && oldStartIndex <= oldEndIndex) {
    if (oldStartVnode === null) {
      oldStartVnode = oldChild[++oldStartIndex]
    } else if (oldEndVnode === null) {
      oldEndVnode = oldChild[--oldEndIndex]
    } else if (isSameVnode(newStartVnode, oldStartVnode)) { // // 如果新前和旧前是相同的节点。直接通过递归更新属性和文本或子节点
      patch(oldStartVnode, newStartVnode)
      oldStartVnode = oldChild[++oldStartIndex]
      newStartVnode = newChild[++newStartIndex]
    } else if (isSameVnode(newEndVnode, oldEndVnode)) { // 后后比较
      patch(oldEndVnode, newEndVnode)
      oldEndVnode = oldChild[--oldEndIndex]
      newEndVnode = newChild[--newEndIndex]
    } else if (isSameVnode(oldEndVnode, newStartVnode)) { // 旧后和新前
      patch(oldEndVnode, newStartVnode)
      // 把旧后移动到旧前的前面
      parentEl.insertBefore(oldEndVnode.el, oldStartVnode.el)
      oldEndVnode = oldChild[--oldEndIndex]
      newStartVnode = newChild[++newStartIndex]
    } else if (isSameVnode(oldStartVnode, newEndVnode)) { // 旧前和新后
      patch(oldStartVnode, newEndVnode)
      // 把旧前移动到旧后的下一个节点的前面(旧后的后面)
      parentEl.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
      oldStartVnode = oldChild[++oldStartIndex]
      newEndVnode = newChild[--newEndIndex]
    } else { // 前前后后都不相同，那么就用新前的去旧前和旧后之前进行查找，如果找到就把它移动到旧前的前面，没有找到表示添加的，移动到旧前的前面
      const map = getKeyIndex(oldStartIndex, oldEndIndex, oldChild)
      const moveIndex = map[newEndVnode.key]
      // 存在
      if (moveIndex !== undefined) {
        // 获取到这个节点
        const moveVnode = oldChild[moveIndex]
        // ('moveVnode', moveVnode)
        parentEl.insertBefore(moveVnode.el, oldStartVnode.el)
        oldChild[moveIndex] = null
        patch(moveVnode, newStartVnode)
      } else { // 不存在
        parentEl.insertBefore(createElm(newStartVnode), oldStartVnode.el)
      }
      newStartVnode = newChild[++newStartIndex]
    }

  }
  // 如果新的有剩余直接创建
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      // 把创建的新节点插入到新后的下一个的前面
      parentEl.insertBefore(createElm(newChild[i]), newChild[newEndIndex+1].el || null)
    }
  }
  // 如果旧的有剩余直接删除
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      const child = oldChild[i]
      if (child != undefined) {
        parentEl.removeChild(child.el)
      }
    }
  }
}

function getKeyIndex (start, end, list) {
  const map = {}
  for (let i = start; i <= end; i++) {
    map[list[i].key] = i
  }
  return map
}

function isSameVnode (newVnode, oldVnode) {
  return newVnode.tag === oldVnode.tag && newVnode.key === oldVnode.key
}

function createComponent (vnode) {
  // 调用hook中的init
  
  let i = vnode.data 
  if ((i = i.hook) && (i = i.init)) {
    i(vnode)
  }
  if (vnode.componentInstance) {
    return true
  }
}

// 创建节点 根据虚拟节点，进行创建真实的dom并且递归创建子元素，最后返回真实的dom
export function createElm (vnode) {
  let { tag, children, key, data, text} = vnode
  // 如果是元素节点
  if (typeof tag === 'string') {
    // 如果是组件 直接返回
    if (createComponent(vnode)) {
      return vnode.el = vnode.componentInstance.$el
    }
    vnode.el = document.createElement(tag)
    // 添加属性
    updateProps(vnode)
    // 遍历子节点并且添加到当前节点下
    children.forEach(element => {
      vnode.el.appendChild(createElm(element))
    })
  } else { // 是文本
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

function updateProps (vnode, oldProps = {}) {
  let el = vnode.el
  let newProps = vnode.data || {}
  // 老的有新的没有 直接删除老的
  for (let key in oldProps) {
    if (!newProps[key]) {
      el.removeAttribute(key)
    }
  }
  // 单独处理样式
  const newStyle = newProps.style || {}
  const oldStyle = oldProps.style || {}
  // 新的没有这个样式直接删除
  for (const key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = ''
    }
  }
  // 把新的中的样式全部在老的中替换一次
  for (let key in newProps) {
    if (key === 'style') {
      for(let i in newProps[key]){
        el.style[i] = newProps[key][i]
      }
    } else if (key === 'class') {
      el.className = newProps[key]
    } else {
      el.setAttribute(key, newProps[key])
    }
  }
}