import { utils, ethers } from "ethers";
import {
  Vault__factory,
  Distribution__factory,
  Zapper__factory,
  Addy__factory,
  Pool__factory,
} from "./types/typechain";
import chalk from "chalk";
import createInterface from "./utils";
import fs from "fs";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

// TO-DO
function connectedWalletBalance() {}

async function main() {
  // DECLARE CONSTANTS
  const { RPC_HOST, ADDY, ZAPPER_API_KEY } = process.env;
  const provider = new ethers.providers.JsonRpcProvider(RPC_HOST);

  const gasPrice = 5 * 1000000000;

  // LOAD CONTRACTS

  // ADDY
  const ADDY_ADDRESS = "0xc3FdbadC7c795EF1D6Ba111e06fF8F16A20Ea539";
  const addy = Addy__factory.connect(ADDY_ADDRESS, provider);

  // ADDY-WETH VAULT mint
  const VAULT_ADDRESS = "0xF7661EE874Ec599c2B450e0Df5c40CE823FEf9d3";
  const vault = Vault__factory.connect(VAULT_ADDRESS, provider);

  // DISTRIBUTOR 50% withdraw penalty
  const DISTRIBUTOR_ADDRESS = "0x920f22E1e5da04504b765F8110ab96A20E6408Bd";
  const distributor = Distribution__factory.connect(
    DISTRIBUTOR_ADDRESS,
    provider
  );

  // ZAP_IN
  const ZAPPER_ADDRESS = "0xf231be40d73a9e73d859955344a4ff74f448df34";
  const zapper = Zapper__factory.connect(ZAPPER_ADDRESS, provider);

  // POOL
  const POOL_ADDRESS = "0xa5BF14BB945297447fE96f6cD1b31b40d31175CB";
  const pool = Pool__factory.connect(POOL_ADDRESS, provider);

  const balance = await vault.balanceOf(ADDY);
  const earned = await vault.earned(ADDY);

  console.log(`Our vault balance is: ${utils.formatEther(balance)}`);
  console.log(`Our earned balance is: ${utils.formatEther(earned)}`);

  // print provider info

  console.log(`Gas Price: ${utils.formatEther(await provider.getGasPrice())}`);

  // get signer
  const { rl, input } = createInterface();
  const password = await input(chalk.red("Enter password: "));
  rl.close();

  // need to specify encoding for correct type inference
  const encryptedWalletJSON = fs.readFileSync("wallet.json", "utf-8");
  //const encryptedWallet = JSON.parse(encryptedWalletJSON);
  //console.log(encryptedWalletJson);

  const wallet = ethers.Wallet.fromEncryptedJsonSync(
    encryptedWalletJSON,
    password
  );
  const walletConnected = wallet.connect(provider);

  console.log(
    `${chalk.blue("MATIC balance")}: ${utils.formatEther(
      await walletConnected.getBalance()
    )}`
  );
  console.log(`Nonce: ${await walletConnected.getTransactionCount()}`);
  // MINT FROM VAULT
  const vaultWithSigner = vault.connect(walletConnected);
  /*

  const tx = await vaultWithSigner.getReward({ gasPrice: 5 * 1000000000 });
  await tx.wait();

  console.log(tx);

  // WITHDRAW
  const withdrawableBalance = await distributor.withdrawableBalance(ADDY);
  const distributorWithSigner = distributor.connect(walletConnected);
  console.log(
    `Withdrawable amount: ${utils.formatEther(withdrawableBalance.amount)}`
  );
  // using amount instead of penaltyAmount gave a error during gas estimation (revert) "Insufficient balance after penalty"
  const withdrawTX = await distributorWithSigner.withdraw(
    withdrawableBalance.penaltyAmount,
    {
      gasPrice,
    }
  );
  await withdrawTX.wait();

  console.log(withdrawTX);

  console.log(withdrawTX.hash);

  */
  // ZAP - IN
  const addyBalance = await addy.balanceOf(ADDY);

  console.log(addyBalance.toString());
  console.log(utils.formatEther(addyBalance));
  const zapperURL = new URL(
    "https://api.zapper.fi/v1/zap-in/pool/quickswap/transaction"
  );
  const params = {
    gasPrice,
    ownerAddress: ADDY,
    sellAmount: addyBalance,
    sellTokenAddress: ADDY_ADDRESS,
    poolAddress: POOL_ADDRESS,
    slippagePercentage: "0.05", // 5%
    network: "polygon",
    api_key: ZAPPER_API_KEY,
  };

  Object.keys(params).forEach((key, value) => {
    zapperURL.searchParams.append(key, params[key]);
  });

  console.log(ZAPPER_API_KEY);
  console.log(zapperURL.toString());

  const response = await fetch(zapperURL.toString());
  const responseJSON = await response.json();

  const minPoolTokens = (responseJSON as any).minTokens;

  const zapperWithSigner = zapper.connect(walletConnected);
  const zapInTX = await zapperWithSigner.ZapIn(
    ADDY_ADDRESS,
    POOL_ADDRESS,
    addyBalance,
    minPoolTokens,
    "0x0000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000120",
    ADDY,
    false,
    false,
    { gasPrice }
  );
  await zapInTX.wait();

  console.log(zapInTX);

  // STAKE

  const poolBalance = await pool.balanceOf(ADDY);
  console.log(`Pool Balance: ${utils.formatEther(poolBalance)}`);
  const threeYears = 94608000;

  const stakeTX = await vaultWithSigner.stakeLocked(poolBalance, threeYears);

  await stakeTX.wait();

  console.log(stakeTX.hash);

  console.log(chalk.greenBright("DONE!!"));
}

main();
