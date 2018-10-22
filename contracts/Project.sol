pragma solidity ^0.4.25;


contract Project {
  // 资金支出列表 item
  struct Payment {
    string description;
    uint amount;
    address receiver;
    bool completed;
    address[] voters;
  }

  address public owner;
  string public description;
  uint public goal;
  uint public minInvest;
  uint public maxInvest;
  address[] public investors;
  Payment[] public payments;

  // 初始化需要项目名称 融资上下限以及融资金额
  constructor(string _description, uint _minInvest, uint _maxInvest, uint _goal) public {
    owner = msg.sender;
    description = _description;
    minInvest = _minInvest;
    maxInvest = _maxInvest;
    goal = _goal;
  }


  // 参与项目投资的接口，投资人调用该接口时要求发送满足条件的投资资金，并且要求没有达到融资上限
  function contribute() public payable {
    require(msg.value >= minInvest);
    require(msg.value <= maxInvest);
    require(address(this).balance <= goal);

    investors.push(msg.sender);
  }

  // 项目发起人发起资金支出请求，要求传入资金支出的细节信息
  function createPayment(string _description, uint _amount, address _receiver) public payable {
    Payment memory newPayment = Payment({
      description: _description,
      amount: _amount,
      receiver: _receiver,
      completed: false,
      voters: new address[](0)
    });

    payments.push(newPayment);
  }

  // 投票赞成某个资金支出请求，需要指定是哪条请求，要求投票的人是投资人，并且检查重复投票情况；
  function approvePayment(uint index) public {
    Payment storage payment = payments[index];

    // must be investor to vote
    bool isInvestor = false;
    for (uint i = 0; i < investors.length; i++) {
      isInvestor = investors[i] == msg.sender;
      if (isInvestor) {
        break;
      }
    }
    require(isInvestor);

    // can not vote twice
    bool hasVoted = false;
    for (uint j = 0; j < payment.voters.length; j++) {
      hasVoted = payment.voters[j] == msg.sender;
      if (hasVoted) {
        break;
      }
    }
    require(!hasVoted);

    payment.voters.push(msg.sender);
  }

  // 完成资金支出，需要指定是哪笔支出，即调用该接口给资金接收方转账，不能重复转账，并且赞成票数超过投资人数量的 50%；
  function finishPayment(uint index) public {
    Payment storage payment = payments[index];

    require(!payment.completed);
    require(payment.voters.length > (investors.length / 2));

    payment.receiver.transfer(payment.amount);
    payment.completed = true;
  }
}