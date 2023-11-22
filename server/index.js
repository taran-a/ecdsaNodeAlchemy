const express = require("express");
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0x7320338aa4211fdb85cc4a887d971804f0c0f689": 100,
  "0x7320338aA4211Fdb85CC4A887d971804f0C0F691": 75,
  "0x7320338aA4211Fdb85CC4A887d971804f0C0F692": 50,
};

const getAddress = (publicKey) => {
  const key = publicKey.slice(1);
  const keyHash = keccak256(key);
  return `0x${secp.utils.bytesToHex(keyHash.slice(-20))}`;
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { signature, recipient, amount } = req.body;

  const messageHash = await secp.utils.sha256(
    Uint8Array.from({ recipient, amount })
  );

  const publicKey = secp.recoverPublicKey(
    messageHash,
    signature[0],
    signature[1]
  );

  const sender = getAddress(publicKey);

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
