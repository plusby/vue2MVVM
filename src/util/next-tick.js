
let callbacks = []
let padding = false
// 执行回调
function flushCallbacks () {
  padding = false
  callbacks.forEach(cb => cb())
  callbacks = []
}
let isUsingMicroTask = false
let timerFunc

// 如果promise存在
if (typeof Promise !== undefined) {
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks)
    isUsingMicroTask = true
  }
} else if (typeof MutationObserver !== undefined) { // MutationObserver存在
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const text = document.createTextNode(counter)
  observer.observe(text, { characterData: true })
  timerFunc = () => {
    text.data = (counter + 1)%2
    isUsingMicroTask = true
  }
} else if (typeof setImmediate !== undefined) {
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks)
  }
}



export function nextTick (cb, ctx) {
  // 存储回调
  callbacks.push(() => {
    if (cb) {
      cb.call(ctx)
    }
  })
  if (!padding) {
    padding = true 
    timerFunc()
  }
}