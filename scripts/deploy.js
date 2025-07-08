const hre = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup accounts & variables
  const [deployer] = await ethers.getSigners()
  const NAME = "VillageChat"
  const SYMBOL = "VC"

  // Deploy contract
  const VillageChat = await ethers.getContractFactory("VillageChat")
  const villageChat = await VillageChat.deploy(NAME, SYMBOL)
  await villageChat.deployed()

  console.log(`Deployed VillageChat Contract at: ${villageChat.address}\n`)

  // Create 3 Channels
  const CHANNEL_NAMES = ["general", "village", "resources"]
  const COSTS = [tokens(1), tokens(0), tokens(0.25)]

  for (var i = 0; i < 3; i++) {
    const transaction = await villageChat.connect(deployer).createChannel(CHANNEL_NAMES[i], COSTS[i])
    await transaction.wait()

    console.log(`Created text channel #${CHANNEL_NAMES[i]}`)
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});