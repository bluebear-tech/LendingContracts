pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract Token is StandardToken {

  string public name;
  string public symbol;
  uint8 public decimals = 18;
  uint public totalSupply;

  constructor(string _name, string _symbol) public {
    balances[msg.sender] = 100000 ether;
    totalSupply = 100000 ether;
    name = _name;
    symbol = _symbol;
  }
}
