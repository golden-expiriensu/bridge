pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../contracts/token.sol";

contract Bridge is AccessControl {
    uint256 immutable chainId;

    address validator;

    mapping(string => address) tokenBySymbol;
    mapping(bytes32 => Swap) swaps;

    enum SwapStatus {
        Undefined,
        Initialized,
        Redeemed
    }

    struct Swap {
        SwapStatus status;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    constructor(uint256 _chainId) {
        chainId = _chainId;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function init(address _validator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        validator = _validator;
    }

    function swap(
        uint256 _amount,
        uint256 _nonce,
        address _recepient,
        uint256 _chainTo,
        string memory _symbol
    ) external {
        require(_chainTo != chainId, "swap: chainId and chainTo are the same");
        require(
            tokenBySymbol[_symbol] != address(0),
            "swap: token symbol cannot be found"
        );

        bytes32 hashedMessage = keccak256(
            abi.encode(_amount, _nonce, _recepient, chainId, _chainTo, _symbol)
        );
        require(swaps[hashedMessage].status == SwapStatus.Undefined);

        BridgeToken(tokenBySymbol[_symbol]).burn(msg.sender, _amount);
        swaps[hashedMessage].status = SwapStatus.Initialized;
    }

    function redeem(
        uint256 _amount,
        uint256 _nonce,
        address _recepient,
        uint256 _chainTo,
        string memory _symbol,
        Swap memory _swap
    ) external {
        require(_chainTo == chainId, "redeem: chainId and chainTo are not the same");
        uint8 v = _swap.v;
        bytes32 r = _swap.r;
        bytes32 s = _swap.s;

        bytes32 hashedMessage = addPrefix(keccak256(
            abi.encode(_amount, _nonce, _recepient, chainId, _chainTo, _symbol)
        ));

        address recoveredAddress = ecrecover(hashedMessage, v, r, s);
        require(recoveredAddress == validator, "redeem: recovered address does not match the validator address");

        BridgeToken(tokenBySymbol[_symbol]).mint(_recepient, _amount);
    }

    function addPrefix(bytes32 message) internal pure returns (bytes32) {
        bytes32 prefix = "\x19Ethereum Signed Message:\n32";
        return keccak256(abi.encode(prefix, message));
    }
}
