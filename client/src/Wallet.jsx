import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { useEffect } from "react";

const getAddress = (publicKey) => {
  const key = publicKey.slice(1);
  const keyHash = keccak256(key);
  return `0x${secp.utils.bytesToHex(keyHash.slice(-20))}`;
};

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
}) {
  const onChangePrivateKey = (e) => {
    const privateKey = e.target.value;
    setPrivateKey(privateKey);

    if (!privateKey) {
      setAddress("");
      return;
    }

    const pubKey = secp.getPublicKey(privateKey);
    const address = getAddress(pubKey);

    setAddress(address);
  };

  const getBalance = async (address) => {
    try {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } catch (e) {
      setBalance(0);
    }
  };

  useEffect(() => {
    getBalance(address);
  }, [address]);

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet address
        <input
          placeholder="Type an address, for example: 0x1"
          value={address}
        ></input>
      </label>

      <label>
        Private key
        <input
          placeholder="Type private key here"
          value={privateKey}
          onChange={onChangePrivateKey}
        ></input>
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
