import { ethers } from 'hardhat';

async function main() {
  const balance = await ethers.provider.getBalance('0x28DF9c2A6f8429AECe7404670756d24F7d3F4487');
  console.log('Balance:', ethers.formatEther(balance), 'POL');
}

main();
