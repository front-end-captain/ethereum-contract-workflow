pragma solidity ^0.4.25;

/**
 * @title SafeMatch
 * @dev Math operations with safety checks that throw on error
 */
library SafeMatch {
  function mul(uint a, uint b) internal pure returns(uint) {
    uint c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function div(uint a, uint b) internal pure returns(uint) {
    // solidity automatically throw error when dividing by 0
    // assert(b > 0);
    uint c = a / b;
    return c;
  }

  function sub(uint a, uint b) internal pure returns(uint) {
    assert(b <= a);
    return a - b;
  }

  function add(uint a, uint b) internal pure returns(uint) {
    uint c = a + b;
    assert(c >= a);
    return c;
  }
}


contract ProjectList {
  using SafeMatch for uint;

  address[] public projects;

  function createProject(string _description, uint _minInvest, uint _maxInvest, uint _goal) public {
    address newProject = new Project(_description, _minInvest, _maxInvest, _goal, msg.sender);
    projects.push(newProject);
  }

  function getProjects() public view returns(address[]) {
    return projects;
  }
}


contract Project {
  using SafeMatch for uint;

  // 资金支出列表 item
  struct Payment {
    string description;
    uint amount;
    address receiver;
    bool completed;
    mapping(address => bool) voters;
    uint voterCount;
  }

  address public owner;
  string public description;
  
  /**
   * goal, maxInvest, minInvest 单位都为 wei
   * 投资人在参与众筹时输入的投资资金单位也为 wei 故不需要与 ether 做单位换算
   */
  uint public goal;
  uint public minInvest;
  uint public maxInvest;
  uint public investorCount;
  mapping(address => uint) investors;

  // 资金支出列表
  Payment[] public payments;

  modifier ownerOnly() {
    require(msg.sender == owner);
    _;
  }

  /**
   * 初始化需要项目名称 融资上下限、融资金额以及投资人
   *
   * @param {string} _description 项目名称
   * @param {uint} _minInvest 投资下限
   * @param {uint} _maxInvest 投资上限
   * @param {address} _owner 投资人
   */
  constructor(
    string _description,
    uint _minInvest,
    uint _maxInvest,
    uint _goal,
    address _owner
  ) public {
    require(_maxInvest >= _minInvest);
    require(_goal >= _minInvest);
    require(_goal >= _maxInvest);

    owner = _owner;
    description = _description;
    minInvest = _minInvest;
    maxInvest = _maxInvest;
    goal = _goal;
  }


  /**
   * 投资人参与众筹，需要发送满足投资条件的投资资金（大于投资下限，小于投资上限）
   * 智能合约会将投资人记录在投资人列表中，并更新项目的资金余额
   * 项目投资金额大于众筹目标金额时，将不再接受投资
   */
  function contribute() public payable {
    // msg.value 为投资人参与众筹时的投资金额，单位 wei
    // msg.sender 为投资人
    require(msg.value >= minInvest);
    require(msg.value <= maxInvest);

    uint newBalance = 0;
    newBalance = address(this).balance.add(msg.value);
    require(newBalance <= goal);

    if (investors[msg.sender] > 0) {
      investors[msg.sender] += msg.value;
    } else {
      investors[msg.sender] = msg.value;
      investorCount += 1;
    }
  }

  /**
   * 项目发起人发起资金支出请求，要求传入资金支出的细节信息
   *
   * @param {string} _description 资金用途
   * @param {uint} _amount 支出金额
   * @param {address} _reveiver 收款方
   */
  function createPayment(string _description, uint _amount, address _receiver) ownerOnly public {
    Payment memory newPayment = Payment({
      description: _description,
      amount: _amount,
      receiver: _receiver,
      completed: false,
      voterCount: 0
    });

    payments.push(newPayment);
  }

  /**
   * 投资人投票赞成某一个资金支出请求，需要指定是哪条请求，要求投票的人是投资人，并且检查重复投票情况；
   *
   * @param {uint} index 存在于资金支出请求数组中的某一个支出请求的索引
   */
  function approvePayment(uint index) public {
    Payment storage payment = payments[index];

    // must be investor to vote
    require(investors[msg.sender] > 0);

    // can not vote twice
    require(!payment.voters[msg.sender]);
    payment.voters[msg.sender] = true;
    payment.voterCount += 1;
  }

  /**
   * 完成资金支出，需要指定是哪笔支出，即调用该接口给资金接收方转账，不能重复转账
   * 并且赞成票数超过投资人数量的 50%
   *
   * @param {uint} index 存在于资金支出请求数组中的某一个支出请求的索引
   */
  function finishPayment(uint index) ownerOnly public {
    Payment storage payment = payments[index];

    require(!payment.completed);
    require(address(this).balance >= payment.amount);
    require(payment.voterCount > (investorCount / 2));
    payment.receiver.transfer(payment.amount);
    payment.completed = true;
  }
}
