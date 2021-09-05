import ethers from "ethers";
import fs from "fs";
import chalk from "chalk";
import createInterface from "./utils";

async function encryptWallet() {
  const { rl, input } = createInterface();

  const mnemonic = await input(chalk.red("Enter") + " mnemonic: ");
  const password = await input(chalk.blue("Enter") + " Password: ");

  console.log(mnemonic);

  rl.close();

  const wallet = ethers.Wallet.fromMnemonic(mnemonic);

  console.log(wallet.address);

  const encryptedWalletJson = await wallet.encrypt(password);

  console.log("Done");

  fs.writeFileSync("wallet.json", encryptedWalletJson);
  console.log("File written successfully\n");
  return;
}

async function main() {
  await encryptWallet();
  console.log("main done");
  //await getAbi();
}

main();
