# ethereum-contract-workflow

## 众筹智能合约

> 智能合约管理的基本数据单元是项目，指资金募集方可以创建和管理供投资者可以参与的项目，而项目需要具备基本属性，也需要存储项目生命周期中的各种数据。实战中会使用 Project 来命名项目智能合约。

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

— **创建项目** 创建项目时需要指定项目名称，基本投资规则，自动记录项目的所有者；

- **参与众筹** 参与的含义是投资人选定某个项目，并向智能合约转账，智能合约会把投资人记录在投资人列表中，并更新项目的资金余额；
- **创建资金支出条目** 项目所有者有权限在项目上发起资金支出请求，需要提供资金用途、支出金额、收款方，默认为未完成状态，创建资金支出条目前需要检查资金余额是否充足；
- **给资金支出条目投票** 投资人看到新的资金支出请求之后会选择投赞成票还是反对票，投票过程需要被如实记录，为了简化，我们只记录赞成票；
- **完成资金支出** 项目所有者在资金支出请求达到超过半数投资人投赞成票的条件时才有权进行此操作，操作结果是直接把对应的金额转给收款方，转账前也要进行余额检查；

## 众筹 DApp
### 路由规划

