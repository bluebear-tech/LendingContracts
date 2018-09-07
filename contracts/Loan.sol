pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "paradigm-solidity/contracts/SubContract.sol";
import "./Token.sol";

contract Loan is SubContract {
    using SafeMath for uint;

    mapping (address => mapping (address => uint)) pendingTransfers;

    constructor(string _makerArguments, string _takerArguments) public {
        makerArguments = _makerArguments;
        takerArguments = _takerArguments;
    }

    struct Lender {
      address lenderAddress;
      uint lentAmount;
    }

    struct LoanRequest {
      Lender[] lenders;
    }

    mapping (bytes32 => LoanRequest) loanRequests;
    mapping (bytes32 => uint) remainingLoanAmounts;

    function participate(bytes32[] makerArguments, bytes32[] takerArguments) public returns (bool) {
        bytes32 id = identify(makerArguments);
        address maker = address(makerArguments[0]);
        Token requestedToken = Token(address(makerArguments[1]));
        uint requestedQuantity = uint(makerArguments[2]);
        address taker = address(takerArguments[0]);
        uint takenQuantity = uint(takerArguments[1]);

        if (takenQuantity >= requestedQuantity) {
            requestedToken.transferFrom(taker, maker, requestedQuantity);
        } else if (takenQuantity < requestedQuantity) {
            Lender[] lenders = loanRequests[id].lenders;

            if (lenders.length == 0) {
                lenders.push(Lender({
                    lenderAddress : taker,
                    lentAmount : takenQuantity
                }));

                pendingTransfers[address(requestedToken)][taker] = takenQuantity;

                // TODO: TEST WITH 3+ LENDERS
                // TODO: TEST MULTIPLE LENDERS DOESN'T EXCEED AMOUNT
                // TODO: TEST EXPIRATION IS TAKEN INTO ACCOUNT FOR PENDING AMOUNTS
                // TODO: HANDLE EXPIRATIONS
                remainingLoanAmounts[id] = requestedQuantity - takenQuantity;
            } else {
                lenders.push(Lender({
                    lenderAddress : taker,
                    lentAmount : takenQuantity
                }));

                if((remainingLoanAmounts[id] - takenQuantity) == 0) {
                    for(uint i = 0; i < lenders.length; i++) {
                        requestedToken.transferFrom(lenders[i].lenderAddress, maker, lenders[i].lentAmount);
                    }
                }
            }
        }

        return true;
    }

    function totalPending(address token, address lender) public returns(uint) {
        return pendingTransfers[token][lender];
    }

    function identify(bytes32[] makerArguments) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(makerArguments));
    }
}
