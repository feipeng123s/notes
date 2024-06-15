## 什么是RabbitMQ？
MQ全称为Message Queue，即消息队列， RabbitMQ是由erlang语言开发，基于AMQP（Advanced Message Queue 高级消息队列协议）协议实现的消息队列，它是一种应用程序之间的通信方法，消息队列在分布式系统开发中应用非常广泛。

### 应用场景
1. 异步任务处理    
   将不需要同步处理的并且耗时长的操作由消息队列通知消息接收方进行异步处理。提高了应用程序的响应时间。
2. 应用程序解耦    
   MQ相当于一个中介，生产方通过MQ与消费方交互，它将应用程序进行解耦。
3. 流量削峰

### AMQP
AMQP是一套公开的消息队列协议，最早在2003年被提出，它旨在从协议层定义消息通信数据的标准格式，为的就是解决MQ市场上协议不统一的问题。RabbitMQ就是遵循AMQP标准协议开发的MQ服务。


## 工作原理
RabbitMQ的组成部分如下：
- Producer：消息生产者，即生产方客户端，生产方客户端将消息发送到MQ。
- Broker：消息队列服务进程
  - Exchange：消息队列交换机，按一定的规则将消息路由转发到某个队列，对消息进行过虑。
  - Queue：消息队列，存储消息的队列，消息到达队列并转发给指定的消费方。
  - Binding: Exchange和Queue之间的虚拟连接，Binding中可以包含多个Routing key
  - Routing key：路由规则，用它来确认如何路由一个特定消息
  - Virtual Host：虚拟主机，一个 Broker 中可以设置多个 Virtual Host，用作不同用户的权限隔离。
    - Broker 可以理解为整个数据库服务，而 Virtual Host 就是其中每个数据库的感觉，不同项目可以对应不同的数据库，其中有着项目所属的业务表等等。
    - 每个 Virtual Host 中，可以有若干个 Exchange 和 Queue。
- Consumer：消息消费者，即消费方客户端，接收MQ转发的消息。
- Connection：应用程序与Broker之间的网络连接
  - Channel：信道，可以建立多个Channel，每个Channel代表一个会话任务。信道是建立在TCP连接内的虚拟连接，信息的读写都通过信道传输，因为对于操作系统而言，建立和销毁TCP是非常昂贵的，所以引入了信道的概念，以复用一条TCP连接。



消息发布接收流程：

-----发送消息-----

1、生产者和Broker建立TCP连接。

2、生产者和Broker建立通道。

3、生产者通过通道消息发送给Broker，由Exchange将消息进行转发。

4、Exchange将消息转发到指定的Queue（队列）


----接收消息-----

1、消费者和Broker建立TCP连接

2、消费者和Broker建立通道

3、消费者监听指定的Queue（队列）

4、当有消息到达Queue时Broker默认将消息推送给消费者。

5、消费者接收到消息。

## Exchange种类
- direct：消息中的路由键（routing key）如果和 Binding 中的 binding key 一致， 交换器就将消息发到对应的队列中。
- fanout：每个发到 fanout 类型交换器的消息都会分到所有绑定的队列上去。fanout 交换器不处理路由键，只是简单的将队列绑定到交换器上，每个发送到交换器的消息都会被转发到与该交换器绑定的所有队列上。很像子网广播，每台子网内的主机都获得了一份复制的消息。fanout 类型转发消息是最快的。
- topic：topic交换器通过模式匹配分配消息的路由键属性，将路由键和某个模式进行匹配，此时队列需要绑定到一个模式上。
- header（header 交换器和 direct 交换器完全一致，但性能差很多，目前几乎用不到了）

## Rabbit的几种模式
RabbitMQ从信息接收者角度可以看做三种模式：
- 一对一
- 一对多(此一对多并不是发布订阅，而是每条信息只有一个接收者)
- 发布订阅  

其中一对一是简单队列模式，一对多是Worker模式，而发布订阅包括发布订阅模式，路由模式和通配符模式，为什么说发布订阅模式包含三种模式呢，其实发布订阅，路由，通配符三种模式只是使用交换机(Exchange)类型不一致

1. 简单队列：耦合性高，生产者消费者一一对应
2. Work queues：一个生产者，多个消费者共同处理消息。Distributing tasks among workers (the competing consumers pattern)
3. Publish/Subscribe：一个生产者多个消费者，每一个消费者有自己的一个队列，生产者直接将消息发送给交换机，交换机将消息发送给队列，每一个队列都需要绑定到交换机。
4. Routing：路由模式是在发布订阅模式基础上的完善，可以在生产消息的时候加入key值，与key值匹配的消费者消费信息。
5. Topic：通配符模式是在路由模式的升级，他允许key模糊匹配。*代表一个词，#代表一个或多个词。
6. RPC
7. Publisher Confirms



## Work queues中的概念
### Round-robin dispatching（循环分发）
> 默认情况下，RabbitMQ 会将每条消息按顺序发送给下一个消费者。 平均而言，每个消费者都会收到相同数量的消息。 这种分发消息的方式称为`round-robin`。 

### Message acknowledgment（消息确认）
> 在实际应用中，可能会发生消费者收到 Queue 中的消息，但没有处理完成就宕机（或出现其他意外）的情况，这种情况下就可能会导致消息丢失。  
> 为了避免这种情况发生，我们可以要求消费者在消费完消息后发送一个回执给 RabbitMQ，RabbitMQ 收到消息回执（Message acknowledgment）后才将该消息从 Queue 中移除；如果 RabbitMQ 没有收到回执并检测到消费者的 RabbitMQ 连接断开，则 RabbitMQ 会将该消息发送给其他消费者（如果存在多个消费者）进行处理。  
> 超时（默认为 30 分钟）对消费者交付确认强制执行。 这有助于检测从不确认交付的有问题（卡住）的消费者。

在前面的示例中已关闭手动消费者确认。 是时候使用`{noAck: false}`选项打开它们，并在我们完成任务后发送来自工作人员的适当确认。
```javascript
channel.consume(queue, function(msg) {
  var secs = msg.content.toString().split('.').length - 1;

  console.log(" [x] Received %s", msg.content.toString());
  setTimeout(function() {
    console.log(" [x] Done");
    channel.ack(msg);
  }, secs * 1000);
  }, {
    // manual acknowledgment mode,
    // see ../confirms.html for details
    noAck: false
  });
```

### Message durability （消息持久化）
> 如果我们希望即使在 RabbitMQ 服务重启的情况下，也不会丢失消息，我们可以将 Queue 与 Message 都设置为可持久化的（durable），这样可以保证绝大部分情况下我们的 RabbitMQ 消息不会丢失。但依然解决不了小概率丢失事件的发生（比如 RabbitMQ 服务器已经接收到生产者的消息，但还没来得及持久化该消息时 RabbitMQ 服务器就断电了），如果我们需要对这种小概率事件也要管理起来，那么我们要用到事务。

queue使用`{durable: true}`选项启用该功能
```javascript
// 第一次创建时设置
channel.assertQueue('hello', {durable: true});
```

channel使用`{persistent: true}`选项启用该功能
```javascript
channel.sendToQueue(queue, Buffer.from(msg), {persistent: true});
```


### Fair dispath（公平分发）
分发机制不是那么优雅，默认状态下，RabbitMQ 将第 n 个 Message 分发给第 n 个 Consumer。n 是取余后的，它不管 Consumer 是否还有 unacked Message，只是按照这个默认的机制进行分发。那么如果有个 Consumer 工作比较重，那么就会导致有的 Consumer 基本没事可做，有的 Consumer 却毫无休息的机会。

为了解决这个问题，我们可以使用值为 `1` 的 `prefetch` 方法。这告诉 RabbitMQ 一次不要给一个 worker 一个以上的消息。 或者，换句话说，在 worker 处理并确认前一条消息之前，不要向它发送新消息。 相反，它将把它分派给下一个还不忙的工人。
```javascript
channel.prefetch(1);
```