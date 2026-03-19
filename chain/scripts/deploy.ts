import { ethers, run } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  const Game2048 = await ethers.getContractFactory("Game2048");
  console.log("Deploying Game2048...");
  const game = await Game2048.deploy();
  await game.waitForDeployment();

  const address = await game.getAddress();
  console.log("Game2048 deployed to:", address);

  // Save address for frontend
  const outDir = path.resolve(__dirname, "../../lib");
  fs.writeFileSync(
    path.join(outDir, "contract-address.json"),
    JSON.stringify({ address, chainId: 8453, network: "base" }, null, 2)
  );
  console.log("Address saved to lib/contract-address.json");

  // Save ABI for frontend
  const artifact = await ethers.getContractFactory("Game2048");
  const abi = artifact.interface.formatJson();
  fs.writeFileSync(path.join(outDir, "contract-abi.json"), abi);
  console.log("ABI saved to lib/contract-abi.json");

  // Wait for confirmations before verify
  console.log("Waiting for 5 confirmations...");
  const tx = game.deploymentTransaction();
  if (tx) await tx.wait(5);

  // Verify on BaseScan
  console.log("Verifying on BaseScan...");
  try {
    await run("verify:verify", {
      address,
      constructorArguments: [],
    });
    console.log("Verified on BaseScan!");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Already Verified")) {
      console.log("Already verified!");
    } else {
      console.error("Verification failed:", msg);
      console.log("You can verify manually later with:");
      console.log(`  npx hardhat verify --network base ${address}`);
    }
  }

  console.log("\nDone! Contract:", `https://basescan.org/address/${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
