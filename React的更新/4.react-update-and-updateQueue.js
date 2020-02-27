什么是Update？
1.用于记录组件状态的改变
2.存放于UpdateQueue中
3.多个Update可以同时存在。👇👇👇

例如一个事件️里面产生了三个setState。
三次setState会产生三次Update对象，
他们不会一次setState就产生一次更新应用，
而是等三个setState执行完了，
三个Update创建完放到UpdateQueue里面，
然后在进行一个更新的操作。




expirationTime 公式

const UNIT_SIZE = 10
const MAGIC_NUMBER_OFFSET = 2

export function msToExpirationTime(ms: number): ExpirationTime {
  return ((ms / UNIT_SIZE) | 0) + MAGIC_NUMBER_OFFSET
}

export function expirationTimeToMs(expirationTime: ExpirationTime): number {
  return (expirationTime - MAGIC_NUMBER_OFFSET) * UNIT_SIZE
}

function ceiling(num: number, precision: number): number {
  return (((num / precision) | 0) + 1) * precision
}

function computeExpirationBucket(
  currentTime,
  expirationInMs,
  bucketSizeMs,
): ExpirationTime {
  return (
    MAGIC_NUMBER_OFFSET +
    ceiling(
      currentTime - MAGIC_NUMBER_OFFSET + expirationInMs / UNIT_SIZE,
      bucketSizeMs / UNIT_SIZE,
    )
  )
}

export const LOW_PRIORITY_EXPIRATION = 5000
export const LOW_PRIORITY_BATCH_SIZE = 250

export function computeAsyncExpiration(
  currentTime: ExpirationTime,
): ExpirationTime {
  return computeExpirationBucket(
    currentTime,
    LOW_PRIORITY_EXPIRATION,
    LOW_PRIORITY_BATCH_SIZE,
  )
}

export const HIGH_PRIORITY_EXPIRATION = __DEV__ ? 500 : 150
export const HIGH_PRIORITY_BATCH_SIZE = 100

export function computeInteractiveExpiration(currentTime: ExpirationTime) {
  return computeExpirationBucket(
    currentTime,
    HIGH_PRIORITY_EXPIRATION,
    HIGH_PRIORITY_BATCH_SIZE,
  )
}
React 中有两种类型的ExpirationTime，一个是Interactive的，另一种是普通的异步。Interactive的比如说是由事件触发的，那么他的响应优先级会比较高因为涉及到交互。

在整个计算公式中只有currentTime是变量，也就是当前的时间戳。我们拿computeAsyncExpiration举例，在computeExpirationBucket中接收的就是currentTime、5000和250

最终的公式就是酱紫的：((((currentTime - 2 + 5000 / 10) / 25) | 0) + 1) * 25

其中25是250 / 10，| 0的作用是取整数

翻译一下就是：当前时间加上498然后处以25取整再加1再乘以 5，需要注意的是这里的currentTime是经过msToExpirationTime处理的，也就是((now / 10) | 0) + 2，所以这里的减去2可以无视，而除以 10 取整应该是要抹平 10 毫秒内的误差，当然最终要用来计算时间差的时候会调用expirationTimeToMs恢复回去，但是被取整去掉的 10 毫秒误差肯定是回不去的。

现在应该很明白了吧？再解释一下吧：简单来说在这里，最终结果是以25为单位向上增加的，比如说我们输入10002 - 10026之间，最终得到的结果都是10525，但是到了10027的到的结果就是10550，这就是除以25取整的效果。

另外一个要提的就是msToExpirationTime和expirationTimeToMs方法，他们是想换转换的关系。有一点非常重要，那就是用来计算expirationTime的currentTime是通过msToExpirationTime(now)得到的，也就是预先处理过的，先处以10再加了2，所以后面计算expirationTime要减去2也就不奇怪了

小结一下
React 这么设计抹相当于抹平了25ms内计算过期时间的误差，那他为什么要这么做呢？我思考了很久都没有得到答案，直到有一天我盯着代码发呆，看到LOW_PRIORITY_BATCH_SIZE这个字样，bacth，是不是就对应batchedUpdates？再细想了一下，这么做也许是为了让非常相近的两次更新得到相同的expirationTime，然后在一次更新中完成，相当于一个自动的batchedUpdates。

不禁感叹，真的是细啊！

以上就是expirationTime的计算方法。
