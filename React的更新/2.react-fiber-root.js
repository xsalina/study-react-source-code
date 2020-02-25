// FiberRoot是什么？
//  1.整个应用的起点
//  2.包含应用挂在的目标节点
//  3.记录整个应用更新过程的各种信息


//创建 FiberRoot
export function createFiberRoot(
    containerInfo: any,
    isConcurrent: boolean,
    hydrate: boolean,
  ): FiberRoot {
    // Cyclic construction. This cheats the type system right now because
    // stateNode is any.
    // 创建fiber对象
    const uninitializedFiber = createHostRootFiber(isConcurrent);
  
    let root;
    if (enableSchedulerTracing) {
      root = ({
        current: uninitializedFiber,
        containerInfo: containerInfo,
        pendingChildren: null,
  
        earliestPendingTime: NoWork,
        latestPendingTime: NoWork,
        earliestSuspendedTime: NoWork,
        latestSuspendedTime: NoWork,
        latestPingedTime: NoWork,
  
        didError: false,
  
        pendingCommitExpirationTime: NoWork,
        finishedWork: null,
        timeoutHandle: noTimeout,
        context: null,
        pendingContext: null,
        hydrate,
        nextExpirationTimeToWorkOn: NoWork,
        expirationTime: NoWork,
        firstBatch: null,
        nextScheduledRoot: null,
  
        interactionThreadID: unstable_getThreadID(),
        memoizedInteractions: new Set(),
        pendingInteractionMap: new Map(),
      }: FiberRoot);
    } else {
      root = ({
        current: uninitializedFiber,
        containerInfo: containerInfo,
        pendingChildren: null,
  
        earliestPendingTime: NoWork,
        latestPendingTime: NoWork,
        earliestSuspendedTime: NoWork,
        latestSuspendedTime: NoWork,
        latestPingedTime: NoWork,
  
        didError: false,
  
        pendingCommitExpirationTime: NoWork,
        finishedWork: null,
        timeoutHandle: noTimeout,
        context: null,
        pendingContext: null,
        hydrate,
        nextExpirationTimeToWorkOn: NoWork,
        expirationTime: NoWork,
        firstBatch: null,
        nextScheduledRoot: null,
      }: BaseFiberRootProperties);
    }
  
    uninitializedFiber.stateNode = root;
  
    // The reason for the way the Flow types are structured in this file,
    // Is to avoid needing :any casts everywhere interaction tracing fields are used.
    // Unfortunately that requires an :any cast for non-interaction tracing capable builds.
    // $FlowFixMe Remove this :any cast and replace it with something better.
    return ((root: any): FiberRoot);
  }


  type BaseFiberRootProperties = {
    // root节点，render方法接收的第二个参数
    containerInfo: any,
    // 只有在持久更新中会用到，也就是不支持增量更新的平台，react-dom不会用到
    pendingChildren: any,
    // 当前应用对应的Fiber对象，是Root Fiber
    current: Fiber,
  
    // 一下的优先级是用来区分
    // 1) 没有提交(committed)的任务
    // 2) 没有提交的挂起任务
    // 3) 没有提交的可能被挂起的任务
    // 我们选择不追踪每个单独的阻塞登记，为了兼顾性能
    // The earliest and latest priority levels that are suspended from committing.
    // 最老和新的在提交的时候被挂起的任务
    earliestSuspendedTime: ExpirationTime,
    latestSuspendedTime: ExpirationTime,
    // The earliest and latest priority levels that are not known to be suspended.
    // 最老和最新的不确定是否会挂起的优先级（所有任务进来一开始都是这个状态）
    earliestPendingTime: ExpirationTime,
    latestPendingTime: ExpirationTime,
    // The latest priority level that was pinged by a resolved promise and can
    // be retried.
    // 最新的通过一个promise被reslove并且可以重新尝试的优先级
    latestPingedTime: ExpirationTime,
  
    // 如果有错误被抛出并且没有更多的更新存在，我们尝试在处理错误前同步重新从头渲染
    // 在`renderRoot`出现无法处理的错误时会被设置为`true`
    didError: boolean,
  
    // 正在等待提交的任务的`expirationTime`
    pendingCommitExpirationTime: ExpirationTime,
    // 已经完成的任务的FiberRoot对象，如果你只有一个Root，那他永远只可能是这个Root对应的Fiber，或者是null
    // 在commit阶段只会处理这个值对应的任务
    finishedWork: Fiber | null,
    // 在任务被挂起的时候通过setTimeout设置的返回内容，用来下一次如果有新的任务挂起时清理还没触发的timeout
    timeoutHandle: TimeoutHandle | NoTimeout,
    // 顶层context对象，只有主动调用`renderSubtreeIntoContainer`时才会有用
    context: Object | null,
    pendingContext: Object | null,
    // 用来确定第一次渲染的时候是否需要融合
    +hydrate: boolean,
    // 当前root上剩余的过期时间
    // TODO: 提到renderer里面区处理
    nextExpirationTimeToWorkOn: ExpirationTime,
    // 当前更新对应的过期时间
    expirationTime: ExpirationTime,
    // List of top-level batches. This list indicates whether a commit should be
    // deferred. Also contains completion callbacks.
    // TODO: Lift this into the renderer
    // 顶层批次（批处理任务？）这个变量指明一个commit是否应该被推迟
    // 同时包括完成之后的回调
    // 貌似用在测试的时候？
    firstBatch: Batch | null,
    // root之间关联的链表结构
    nextScheduledRoot: FiberRoot | null,
  };

