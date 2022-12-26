import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'

export default {
  input: './src/index.js', // 入口
  output: {
    format: 'umd',
    name: 'Vue', // 全局的变量名
    file: 'dist/umd/vue.js', // 输出路径
    sourcemap: true,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    serve({
      port: 3001,
      contentBase: '',
      openPage: '/index.html'
    })
  ]
}