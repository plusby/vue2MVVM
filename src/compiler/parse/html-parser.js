const unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const doctype = /^<!DOCTYPE [^>]+>/i
// #7298: escape - to avoid being passed as HTML comment when inlined in page
const comment = /^<!\--/
const conditionalComment = /^<!\[/


// <div id="app"></div>
export function parseHTML (html, options) {
  while (html) {
    // 如果是以<开头的
    const textEnd = html.indexOf('<')
    // 如果<开头那么就是开始标签或结束标签
    if (textEnd === 0) {
      // 开始标签
      const startTagMatch = parseStartTag(html)
      if (startTagMatch) {
        options.start(startTagMatch.tagName, startTagMatch.attrs)
      }
      // 结束标签
      const endTagMatch = html.match(endTag)
      if (endTagMatch) {
        advance(endTagMatch[0].length)
        options.end(endTagMatch[1])
      }
    }
    // 文本
    let text
    if (textEnd > 0) {
      text = html.substring(0, textEnd)
    }
    // 截取文本
    if (text) {
      advance(text.length)
      options.chars(text)
    }
  }

  function parseStartTag () {
    // 匹配开始标签
    const start = html.match(startTagOpen)
    if (start) {
      // 开始标签的ast
      const match = {
        tagName: start[1],
        attrs: [],
      }
      // 去除匹配到的开始标签
      advance(start[0].length)
      // 匹配开始标签的>
      let attrs
      let end
      // 如果没有到>并且有属性
      while(!(end = html.match(startTagClose)) && (attrs=html.match(attribute))){
        match.attrs.push({
          name: attrs[1],
          value: attrs[3] || attrs[4] || attrs[5]
        })
        advance(attrs[0].length)
      }
      // 截取>
      if (end) {
        advance(end[0].length)
        return match
      }
    }
  }

  function advance(n){
    html = html.substring(n)
  }
}

