pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../contracts/token.sol";

import "hardhat/console.sol";

contract Bridge is AccessControl {

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    address validator;
    uint256 immutable chainId;
    mapping(bytes32 => Swap) swaps;
    mapping(string => address) tokenBySymbol;
    mapping(uint256 => bool) availableChains;

    enum SwapStatus {
        Undefined,
        Initialized,
        Redeemed
    }

    struct Swap {
        SwapStatus status;
    }

    constructor(uint256 _chainId) {
        chainId = _chainId;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    function init(address _validator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        validator = _validator;
    }

    function addToken(string memory _symbol, address tokenAddr) external onlyRole(ADMIN_ROLE){
        tokenBySymbol[_symbol] = tokenAddr;
    }

    function addChain(uint256 _chainId) external onlyRole(ADMIN_ROLE) {
        availableChains[_chainId] = true;
    }

    function swap(
        uint256 _amount,
        uint256 _nonce,
        address _recepient,
        uint256 _chainTo,
        string memory _symbol
    ) external returns (bytes32 hashedMessage){
        require(availableChains[_chainTo], "swap: chainTo is not available");
        require(_chainTo != chainId, "swap: chainId and chainTo are the same");
        require(
            tokenBySymbol[_symbol] != address(0),
            "swap: token symbol cannot be found"
        );

        hashedMessage = keccak256(
            abi.encodePacked(_amount, _nonce, _recepient, chainId, _chainTo, _symbol)
        );
        require(swaps[hashedMessage].status == SwapStatus.Undefined);

        BridgeToken(tokenBySymbol[_symbol]).burn(msg.sender, _amount);
        swaps[hashedMessage].status = SwapStatus.Initialized;

        return hashedMessage;
    }

    function redeem(
        uint256 _amount,
        uint256 _nonce,
        address _recepient,
        uint256 _chainFrom,
        uint256 _chainTo,
        string memory _symbol,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external {
        require(_chainTo == chainId, "redeem: chainId and chainTo are not the same");

        bytes32 hashedMessage = keccak256(
            abi.encodePacked(_amount, _nonce, _recepient, _chainFrom, _chainTo, _symbol)
        );

        address recoveredAddress = ecrecover(addPrefix(hashedMessage), _v, _r, _s);
        require(recoveredAddress == validator, "redeem: recovered address does not match the validator address");
        
        BridgeToken(tokenBySymbol[_symbol]).mint(_recepient, _amount);
    }

    function addPrefix(bytes32 _message) internal pure returns (bytes32) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        return keccak256(abi.encodePacked(prefix, _message));
    }
}
