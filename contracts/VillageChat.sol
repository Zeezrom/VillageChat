// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

//contract library
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract VillageChat is ERC721 {
    uint256 public totalSupply;
    uint256 public totalChannels;
    address public owner;

    // Admin management
    mapping(address => bool) public admins;

    //channel datastructure
    struct Channel {
        uint256 id;
        string name;
        uint256 cost;
    }

//unique key value mapping pairs to variables
    mapping(uint256 => Channel) public channels;
    //checks to make sure someone has joined a channel
    mapping(uint256 => mapping(address => bool)) public hasJoined;

//modifier that can be applied to any function at the end. do require, then do the rest of the body (_;)
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner, "Not authorized");
        _;
    }

    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {
        // assign the one who sent the contract as the owner
        owner = msg.sender;
        // Add owner as first admin
        admins[msg.sender] = true;
    }

    // Admin management functions
    function addAdmin(address _admin) public onlyOwner {
        require(!admins[_admin], "Already an admin");
        admins[_admin] = true;
    }

    function removeAdmin(address _admin) public onlyOwner {
        require(admins[_admin], "Not an admin");
        require(_admin != owner, "Cannot remove owner");
        admins[_admin] = false;
    }

    function isAdmin(address user) public view returns (bool) {
        return admins[user];
    }

//example of use of modifier
    function createChannel(string memory _name, uint256 _cost) public onlyOwner
    {
        totalChannels++;
        channels[totalChannels] = Channel(totalChannels, _name, _cost);
    }

    function mint(uint256 _id) public payable {
        //join channel
        require(_id != 0);
        require(_id <= totalChannels);
        require(hasJoined[_id][msg.sender] == false);
        require(msg.value >= channels[_id].cost);

        //mint nft
        hasJoined[_id][msg.sender] = true;
        totalSupply++;

        _safeMint(msg.sender, totalSupply);
    }

    function getChannel(uint256 _id) public view returns (Channel memory) {
        return channels[_id];
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }
}
