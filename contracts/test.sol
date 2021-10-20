pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract Testt{
    function testRedeem(
        uint256 _number,
        address _validator,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external view {
        bytes32 hashedMessage = keccak256(
            abi.encodePacked(_number)
        );

        address recoveredAddress = ecrecover(addPrefix(hashedMessage), _v, _r, _s);
        require(recoveredAddress == _validator, "address does not match");
    }

    function addPrefix(bytes32 _message) internal pure returns (bytes32) {
    bytes memory prefix = "\x19Ethereum Signed Message:\n32";
    return keccak256(abi.encodePacked(prefix, _message));
    }
}