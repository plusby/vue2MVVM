import { generate } from "./codegen/index.js";
import { parse } from "./parse/index.js";

export function compileToFunction (html, options = {}) {
  // 解析模板成ast
  const ast = parse(html.trim(), options)
  // 静态节点优化

  // 生成render函数
  const code = generate(ast, options)
  console.log('code', code)
  // // ('code222', html, ast, code)
  let render = new Function(`with(this){return ${code}}`)
  return {
    render,
  }
}