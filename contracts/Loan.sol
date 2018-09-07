pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "paradigm-solidity/contracts/SubContract.sol";
import "./Token.sol";

contract Loan is SubContract {
    using SafeMath for uint;

    constructor(string _makerArguments, string _takerArguments) public {
        makerArguments = _makerArguments;
        takerArguments = _takerArguments;
    }

    function participate(bytes32[] makerArguments, bytes32[] takerArguments) public returns (bool) {
        address maker = address(makerArguments[0]);
        Token requestedToken = Token(address(makerArguments[1]));
        uint requestedQuantity = uint(makerArguments[2]);
        address taker = address(takerArguments[0]);
        uint takenQuantity = uint(takerArguments[1]);

        if(requestedQuantity == takenQuantity) {
          requestedToken.transferFrom(taker, maker, takenQuantity);
        } else if(takenQuantity > requestedQuantity) {
          requestedToken.transferFrom(taker, maker, requestedQuantity);
        }

        return true;
    }
}
