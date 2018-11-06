# ethereum-contract-workflow

## 众筹智能合约

> 智能合约管理的基本数据单元是项目，指资金募集方可以创建和管理供投资者可以参与的项目，而项目需要具备基本属性，也需要存储项目生命周期中的各种数据。实战中会使用 _Project_ 来命名项目智能合约。

### 数据结构

- **所有者(owner)** 即项目的发起人，在智能合约层面指调用项目创建合约的账户，数据类型是智能合约中独有的 address 类型
- **项目名称(description)** 项目的简单介绍，方便投资人投资前做检查
- **资金余额(goal)** 表示项目当前状态下的资金余额，如果项目没有任何支出，应该等于所有投资者投入的资金总和，数据类型为数值型
- **融资下限(minInvest)** 投资者投资项目的最小金额，比如项目需要的资金多，可以适当提高门槛，反之可以降低门槛；
- **融资上限(maxInvest)** 投资者投资项目的最大金额，比如项目方从分散风险的角度，避免单个投资人投入金额过大；
- **投资人列表(Investors)** 指调用智能合约投资接口转账，参与投资的账户的集合，集合元素也是 address 类型，存储该集合的目的是为了在资金支出投票时做权限检查，也方便其他投资者了解项目基本状况；
- **资金支出列表(payment)** 项目下所有的资金支出明细都存储在这里，列表中的每个条目会是个复杂的结构，会使用 Solidity 里面的 struct 来规范。
  - **资金用途(description)** 说明该笔资金支出的目的，字符串类型;
  - **支出金额(amount)** 标明资金支出的金额，数值类型；
  - **收款方(receiver)** 该笔资金要转给谁，之所以要记录，是不想让该资金经项目方的手流转到收款方，减少操作空间；
  - **状态(status)** 标明该笔支出是否已经完成；
  - **投票记录(voters)** 记录所有投资人在该笔支出上的投票记录，所有投票过的投资人都会被记录下来；

### 状态流转

- **创建项目** 创建项目时需要指定项目名称，基本投资规则（投资上下限，融资目标），自动记录项目的所有者；

  ``` solidity
  ProjectList.createProject(string description, uint minInvest, uint maxInvest, uint goal)
  ```

- **参与众筹** 参与的含义是投资人选定某个项目，并向智能合约转账，智能合约会把投资人记录在投资人列表中，并更新项目的资金余额；

  ``` solidity
  Project.contribute();
  ```

- **创建资金支出请求** 项目所有者有权限在项目上发起资金支出请求，需要提供资金用途、支出金额、收款方，默认为未完成状态，创建资金支出条目前需要检查资金余额是否充足；

  ``` solidity
  Project.createPayment(string description, uint amount, address receiver);
  ```

- **给资金支出条目投票** 投资人看到新的资金支出请求之后会选择投赞成票还是反对票，投票过程需要被如实记录，为了简化，我们只记录赞成票；

  ``` solidity
  Project.approvePayment(uint index);
  ```

- **完成资金支出** 项目所有者在资金支出请求达到超过半数投资人投赞成票的条件时才有权进行此操作，操作结果是直接把对应的金额转给收款方，转账前也要进行余额检查；

  ``` solidity
  Project.finishPayment(uint index);
  ```

- **获取项目的概览信息** 项目名称，投资下限，投资上限，融资目标金额，账户余额(已募集资金)，参与投资人数，资金支出请求数量，项目发起人

  ``` solidity
  Project.getProjectSummary() returns (string description, uint, minInvest, uint maxInvest, uint goal, uint balance, uint investCount, uint paymentAmount, address owner);
  ```

## 众筹 DApp

### 路由规划

| URL                                | 描述                 |
| ---------------------------------- | -------------------- |
| /                                  | 首页，即项目列表页   |
| /projects/create                   | 项目创建页面         |
| /projects/:address                 | 项目详情页面         |
| /projects/:address/payments/create | 创建资金支出请求页面 |

### API

#### 获取项目列表

``` javascript
/**
 * @returns {array} projectList: Array<string> 包含项目合约地址的数组
 */
getProjectList();
```

#### 获取某一个项目的概览信息

``` javascript
/**
 * @returns {object} {description: string, minInvest: number, maxInvest: number, goal: number, balance: number, investCount: number, paymentAmount: number, owner: string }
 */
getProjectSummary(address: string);
```

#### 创建项目

``` javascript
/**
 * 创建项目
 * @param {string} description 项目名称
 * @param {number} minInvest 投资下限
 * @param {number} maxInvest 投资上限
 * @param {number} goal 融资目标
 */
createProject(description: string, minInvest: number, maxInvest: number, goal: number);
```

#### 创建资金支出请求

``` javascript
/**
 * @param {string} description 资金用途
 * @param {number} amount 请求支出金额
 * @param {number} receiver 收款人
 * NOTE: 检查创建请求的用户是否是项目管理员
 */
createPayment(description: string, amount: number, receiver: string);
```

#### 获取资金支出列表

``` javascript
/**
 * @returns {array} paymentList: Array<{ description: string, amount: number, receiver: string, completed: bool, voterCount: number }>
 * 支出理由(description) 支出金额(amount) 收款人(receiver) 是否完成(completed) 已投票(voterCount)
 * 已投票 = voterCount / invertorCount
 */
getPaymentList();
```

#### 投票

``` javascript
// NOTE: 检查投票人是不是投资人，只有投资人才可以投票
approvePayment(number paymentIndex);
```

#### 完成资金划转

```javascript
finishPayment(number paymentIndex);
```

#### web 端一键化登录 DApp

front-end TODO:

- 检查用户是否在手机端浏览器访问站点

- 用户进入站点后，检查用户浏览器是否安装了 MetaMask 插件，若没有安装，提示用户安装

  ``` javascript
  if (window.web3 === "undefined") {
    console.log("You browser is not installed MetaMask");
  }
  ```

- 检查用户是否登录了 MetaMask ，若没有登录，提示进行登录

  ``` javascript
  if (!web3.eth.coinbase) {
  	console.log("Please login first");
  }
  ```

- 检查用户 MetaMask 插件的网络是否链接，是否在主网，若有异常，提示用户检查网络

  ``` javascript
  we3.eth.net.getId((id) => {
    switch (id) {
      case "1":
        console.log('This is mainnet');
        return;
      case "2":
        console.log('This is the deprecated Morden test network.');
        return;
      case "3":
        console.log('This is the ropsten test network.');
        break;
      case "4":
        console.log('This is the Rinkeby test network.');
        return;
      case "42":
        console.log('This is the Kovan test network.');
        return;
      default:
        console.log('This is an unknown network.');
        return;
    }
  })
  ```

- 用户登录 MetaMask 并在主网上，项服务端发送请求并携带用户钱包地址（publicAddress）检查用户是否注册，若注册则返回 nonce，否则用户填写邮箱和昵称进行注册

- 用户登录 MetaMask 并在主网上，向服务端发送请求并携带用户钱包账户地址（publicAddress）,获取 nonce

- 弹出 MetaMask 窗口，根据 publicAddress 和 nonce 让用户对 nonce 进行签名，在回调函数中将获得用户的签名

- 用户签名后，将 publicAddress 和 signature 发送给服务端进行签名验证，验证成功后将返回 token

- 将上面的 token 在客户端进行存储，在后续的与服务端进行交互都将带上这个 token

- MetaMask 退出后，页面同样进行退出

- 用户切换账号 采取相应的措施


back-end TODO:
- 修改用户模型

  > 用户模型需要增加两个 publicAddress 和 nonce
- 生成随机数 nonce，增加一个接口供前端调用来获取随机数
- 签名验证，分发 token
- 更新 nonce