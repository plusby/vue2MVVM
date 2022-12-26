const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated',
  'errorCaptured',
  'serverPrefetch'
]

const strats = {}
strats.data = function(parentVal={}, childValue={}){
  // ('parentValparentVal', parentVal, childValue)
  if (typeof parentVal === 'function') {
    parentVal = parentVal()
  }
  if (typeof childValue === 'function') {
    childValue = childValue()
  }
  return {
    ...parentVal,
    ...childValue
  }
}
strats.computed = function(parentVal={}, childVal){
  const res = Object.create(parentVal)
  if (childVal) {
    for (let key in childVal) {
      res[key] = childVal[key]
    }
  }
  return res
}
// strats.watch = function(){}

// 生命周期的合并
function mergeHook(parentVal, childValue){
  if (childValue) {
    if (parentVal) {
      return parentVal.concat(childValue)
    } else {
      return [childValue]
    }
  } else {
    return parentVal
  }
}

LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook
})

export function mergeOptions(parent, child){
  let options = {}
  for (let key in parent) {
    mergeField(key)
  }
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key)
    }
  }

  function mergeField (key) {
    // ('key', key)
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key])
    } else {
      if (child[key]) {
        options[key] = child[key]
      } else {
        options[key] = parent[key]
      }
    }
  }
  return options
}