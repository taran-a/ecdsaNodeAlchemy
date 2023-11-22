import { useState } from "react";
import * as secp from "ethereum-cryptography/secp256k1";
import { sha256 } from "ethereum-cryptography/sha256";
import server from "./server";

function Transfer({ privateKey, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const messageHash = sha256(
      Uint8Array.from({
        amount: parseInt(sendAmount),
        recipient,
      })
    );

    const signature = await secp.sign(messageHash, privateKey, {
      recovered: true,
    });

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        signature: [secp.utils.bytesToHex(signature[0]), signature[1]],
        amount: parseInt(sendAmount),
        recipient,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
