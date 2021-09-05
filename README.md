#

![https://zapper.fi](power-zap-gray.svg)

# Hacking

Fill .env as in .env.template

```
RPC_HOST=<>
POLYGONSCAN_API_KEY=<>
ADDY=<YOUR-PERSONAL-ADDRESS>
ZAPPER_API_KEY=<>
```

You should get your own PolygonScan api key, you can get Zapper api key by interacting with Zapper and listeting to network requests, or use the public api key in the docs: [zapper docs](https://docs.zapper.fi/zapper-api/endpoints)

```
  yarn install
  yarn abis
  yarn typechain
```

## Create wallet.json

In order to use a script, I decided to use a JSON Encrypted wallet
From: [ethers docs](https://docs.ethers.io/v5/api/signer/#Wallet-encrypt)

```
node index.js
```

Input mnemonic and password

Comment / uncomment claimRewards.ts

```
yarn claim
```

# ESM Modules with ts-node:

https://stackoverflow.com/questions/63742790/unable-to-import-esm-ts-module-in-node/65163089#65163089

https://github.com/TypeStrong/ts-node/issues/1007
