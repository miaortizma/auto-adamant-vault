import fs from "fs";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

async function fetchAbi(contract, name) {
  const { POLYGONSCAN_API_KEY } = process.env;
  const abiURL = `https://api.polygonscan.com/api?module=contract&action=getabi&address=${contract}&apikey=${POLYGONSCAN_API_KEY}`;
  console.log(abiURL);
  const response = await fetch(abiURL);
  const responseJSON = await response.json();
  try {
    const abi = (responseJSON as any).result;
    fs.writeFileSync(`abi/${name}.json`, abi);
  } catch (e) {
    console.log(e);
  }
}

async function getAbi() {
  console.log("here");
}

async function main() {
  const addresses = [
    ["0xf7661ee874ec599c2b450e0df5c40ce823fef9d3", "vault"],
    ["0x920f22E1e5da04504b765F8110ab96A20E6408Bd", "distribution"],
    ["0xc3FdbadC7c795EF1D6Ba111e06fF8F16A20Ea539", "addy"],
    ["0xf231be40d73a9e73d859955344a4ff74f448df34", "zapper"],
    ["0xa5BF14BB945297447fE96f6cD1b31b40d31175CB", "pool"],
  ];

  const n = addresses.length;
  for (let i = 0; i < n; ++i) {
    const [address, name] = addresses[i];
    fetchAbi(address, name);
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

main();
