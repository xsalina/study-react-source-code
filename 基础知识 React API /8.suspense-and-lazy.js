import React, { Suspense, lazy } from 'react'

const LazyComp = lazy(() => import('./8.lazy.js'))

let data = ''
let promise = ''
function requestData() {
  if (data) return data
  if (promise) throw promise
  promise = new Promise(resolve => {
    setTimeout(() => {
      data = 'Data resolved'
      resolve()
    }, 2000)
  })
  throw promise
}

function SuspenseComp() {
  const data = requestData()

  return <p>{data}</p>
}

export default () => (
  <Suspense fallback="loading data">
    <SuspenseComp />
    <LazyComp />
  </Suspense>
)
/*
*   Suspense 内部有多个组件的时候，他要等到所有的组件resolve之后，他才会把fallback去掉，显示内容出来
                                    Thenable 一般指的是   =>  promise
*    export function lazy<T, R>(ctor: () => Thenable<T, R>): LazyComponent<T> {
        return {
             $$typeof: REACT_LAZY_TYPE, // 相关类型
            _ctor: ctor,
            _status: -1,   // dynamic import 的状态
            _result: null, // 存放加载文件的资源
  };
    
} 
*/
