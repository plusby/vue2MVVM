import { parseHTML } from "./html-parser";





export function parse (template) {
  const stack = []
  let currentParent
  let root
  /**
   * 把html字符串模板转成ast树
   * 静态节点进行优化处理 因为静态节点没有vue的属性，不会变更
   * 通过ast树转成render
   * 
   */
   parseHTML(template, {
    // 开始标签
    start(tagName, attrs) {
      const element = createASTElement(tagName,attrs)
      // 没有根
      if (!root) {
        root = element
      }
      currentParent = element
      stack.push(element)
    },
    // 结束标签
    end (tagName) {
      let element = stack.pop()
      currentParent = stack[stack.length - 1]
      if (currentParent) {
        element.parent = currentParent
        currentParent.children.push(element)
      }
    },
    // 文本
    chars (text) {
      text = text.replace(/\s/g, '')
      if (text) {
        currentParent.children.push({
          text: text,
          type: 3,
          parent: currentParent,
        })
        
      }
    }
   })
   return root
}

function createASTElement (tagName, attrs) {
  return {
    tag: tagName,
    type: 1,
    children: [],
    attrs,
    parent: null,
  }
}
