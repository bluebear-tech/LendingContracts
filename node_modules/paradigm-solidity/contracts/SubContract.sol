pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract SubContract {
    using SafeMath for uint;

    string public makerArguments;
    string public takerArguments;

    function participate(bytes32[] makerData, bytes32[] takerData) public returns (bool);

    function ratioFor(uint value, uint numerator, uint denominator) internal pure returns (uint) {
        return value.mul(numerator).div(denominator);
    }
}
