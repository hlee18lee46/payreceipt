const ReceiptNFT = artifacts.require("ReceiptNFT");

module.exports = async function (deployer) {
  await deployer.deploy(ReceiptNFT);
  const instance = await ReceiptNFT.deployed();
  console.log("ReceiptNFT deployed at:", instance.address);
};