import { nextTick } from "../util/next-tick"


let padding = false
let has = {}
let queue = []

function flushSchedulerQueue(){
  console.log('异步执行了渲染watcher')
  // ('queue', [...queue])
  queue.forEach(watcher => {
    watcher.run()
    if (!watcher.user) {
      watcher.cb && watcher.cb()
    }
  })
  padding = false
  has = {}
  queue = []
}

export function queueWatcher (watcher) {
  const id = watcher.id
  if (!has[id]) {
    queue.push(watcher)
    has[id] = true
    if (!padding) {
      padding = true
      nextTick(flushSchedulerQueue)
    }
  }
}