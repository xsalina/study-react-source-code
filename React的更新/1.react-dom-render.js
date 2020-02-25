const ReactDOM: Object = {
    render(
        element: React$Element<any>,
        container: DOMContainer,
        callback: ?Function,
      ) {
        return legacyRenderSubtreeIntoContainer(
          null,
          element,
          container,
          false,
          callback,
        );
      },
}
function legacyRenderSubtreeIntoContainer(
    parentComponent: ?React$Component<any, any>,//null
    children: ReactNodeList,//<App />
    container: DOMContainer,//document.getElementById('root)
    forceHydrate: boolean,//false
    callback: ?Function,//fun
  ) {
    // TODO: Ensure all entry points contain this check
   
  
    // TODO: Without `any` type, Flow says "Property cannot be accessed on any
    // member of intersection type." Whyyyyyy.
    let root: Root = (container._reactRootContainer: any);
    if (!root) {
      // Initial mount
      // 给document.getElementById('root)  这个元素节点上添加_reactRootContainer属性为Root这个对象，Root是通过createFiberRoot创建的
      root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
        container,
        forceHydrate,
      );
      if (typeof callback === 'function') {
        const originalCallback = callback;
        callback = function() {
          const instance = DOMRenderer.getPublicRootInstance(root._internalRoot);
          originalCallback.call(instance);
        };
      }
      // Initial mount should not be batched.
      //unbatchedUpdates 批量更新的一个操作
      DOMRenderer.unbatchedUpdates(() => {
        if (parentComponent != null) {
          root.legacy_renderSubtreeIntoContainer(
            parentComponent,
            children,
            callback,
          );
        } else {
          root.render(children, callback);
        }
      });
    } else {
      if (typeof callback === 'function') {
        const originalCallback = callback;
        callback = function() {
          const instance = DOMRenderer.getPublicRootInstance(root._internalRoot);
          originalCallback.call(instance);
        };
      }
      // Update
      if (parentComponent != null) {
        root.legacy_renderSubtreeIntoContainer(
          parentComponent,
          children,
          callback,
        );
      } else {
        root.render(children, callback);
      }
    }
    return DOMRenderer.getPublicRootInstance(root._internalRoot);
  }

//删除root下面的子节点并创建了一个Root
function legacyCreateRootFromDOMContainer(
    container: DOMContainer,//root
    forceHydrate: boolean,//false
  ): Root {
     
  
    const shouldHydrate =
      forceHydrate || shouldHydrateDueToLegacyHeuristic(container);//判断id为root元素有没有data-reactroot属性
    // First clear any existing content.
    if (!shouldHydrate) {
      let warned = false;
      let rootSibling;
      while ((rootSibling = container.lastChild)) {
        if (__DEV__) {
          if (
            !warned &&
            rootSibling.nodeType === ELEMENT_NODE &&
            (rootSibling: any).hasAttribute(ROOT_ATTRIBUTE_NAME)
          ) {
            warned = true;
            warningWithoutStack(
              false,
              'render(): Target node has markup rendered by React, but there ' +
                'are unrelated nodes as well. This is most commonly caused by ' +
                'white-space inserted around server-rendered markup.',
            );
          }
        }
        container.removeChild(rootSibling);
      }
    }
    if (__DEV__) {
      if (shouldHydrate && !forceHydrate && !warnedAboutHydrateAPI) {
        warnedAboutHydrateAPI = true;
        lowPriorityWarning(
          false,
          'render(): Calling ReactDOM.render() to hydrate server-rendered markup ' +
            'will stop working in React v17. Replace the ReactDOM.render() call ' +
            'with ReactDOM.hydrate() if you want React to attach to the server HTML.',
        );
      }
    }
    // Legacy roots are not async by default.
    const isConcurrent = false;
    return new ReactRoot(container, isConcurrent, shouldHydrate);
  }
  function ReactRoot(
    container: Container,//root
    isConcurrent: boolean,//false
    hydrate: boolean,//false
  ) {
    //创建了一个FiberRoot赋值给root  执行了createFiberRoot函数
    const root = DOMRenderer.createContainer(container, isConcurrent, hydrate);
    this._internalRoot = root;
  }
  ReactRoot.prototype.render = function(
    children: ReactNodeList,
    callback: ?() => mixed,
  ): Work {
    const root = this._internalRoot;
    const work = new ReactWork();
    callback = callback === undefined ? null : callback;
    if (__DEV__) {
      warnOnInvalidCallback(callback, 'render');
    }
    if (callback !== null) {
      work.then(callback);
    }
    DOMRenderer.updateContainer(children, root, null, work._onCommit);
    return work;
  };
  //创建 FiberRoot
export function createFiberRoot(
    containerInfo: any,
    isConcurrent: boolean,
    hydrate: boolean,
  ): FiberRoot {
    // Cyclic construction. This cheats the type system right now because
    // stateNode is any.
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
  export function updateContainerAtExpirationTime(
    element: ReactNodeList,
    container: OpaqueRoot,
    parentComponent: ?React$Component<any, any>,
    expirationTime: ExpirationTime,
    callback: ?Function,
  ) {
    // TODO: If this is a nested container, this won't be the root.
    const current = container.current;
  
    if (__DEV__) {
      if (ReactFiberInstrumentation.debugTool) {
        if (current.alternate === null) {
          ReactFiberInstrumentation.debugTool.onMountContainer(container);
        } else if (element === null) {
          ReactFiberInstrumentation.debugTool.onUnmountContainer(container);
        } else {
          ReactFiberInstrumentation.debugTool.onUpdateContainer(container);
        }
      }
    }
  
    const context = getContextForSubtree(parentComponent);
    if (container.context === null) {
      container.context = context;
    } else {
      container.pendingContext = context;
    }
  
    return scheduleRootUpdate(current, element, expirationTime, callback);
  }
  function scheduleRootUpdate(
    current: Fiber,
    element: ReactNodeList,
    expirationTime: ExpirationTime,
    callback: ?Function,
  ) {
    if (__DEV__) {
      if (
        ReactCurrentFiber.phase === 'render' &&
        ReactCurrentFiber.current !== null &&
        !didWarnAboutNestedUpdates
      ) {
        didWarnAboutNestedUpdates = true;
        warningWithoutStack(
          false,
          'Render methods should be a pure function of props and state; ' +
            'triggering nested component updates from render is not allowed. ' +
            'If necessary, trigger nested updates in componentDidUpdate.\n\n' +
            'Check the render method of %s.',
          getComponentName(ReactCurrentFiber.current.type) || 'Unknown',
        );
      }
    }
  
    const update = createUpdate(expirationTime);
    // Caution: React DevTools currently depends on this property
    // being called "element".
    update.payload = {element};
  
    callback = callback === undefined ? null : callback;
    if (callback !== null) {
      warningWithoutStack(
        typeof callback === 'function',
        'render(...): Expected the last optional `callback` argument to be a ' +
          'function. Instead received: %s.',
        callback,
      );
      update.callback = callback;
    }
    enqueueUpdate(current, update);
  
    scheduleWork(current, expirationTime);//开始进行任务调度，告诉react我们有任务更新产生了
    return expirationTime;
  }
  



// 过程：我们在ReactDom.render中创建了一个ReactRoot，
// 同时在ReactRoot创建的过程中，我们创建了fiberRoot，
// fiberRoot创建当中也会自动去初始化一个fiber对象，
// 然后我们在root上面创建了一个ExpirationTime，
// 然后又创建了一个update这个更新的对象，
// 然后这个更新的对象放到root的节点上面之后，
// 我们就进入了一个更新的过程，
// 这就是一个创建更新的过程，
// 然后我们再去调度整个任务的更新