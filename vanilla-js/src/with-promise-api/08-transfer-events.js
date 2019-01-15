import { ApiPromise } from '@polkadot/api';

import {
  ALICE, createLog, createError, createWrapper
} from '../commons';
// import the test keyring (already has dev keys for Alice, Bob, Charlie, Eve & Ferdie)
import testKeyring from '@polkadot/keyring/testing';
// utility function for random values
import { randomAsU8a } from '@polkadot/util-crypto';

// Get a random amount between 1 and 100000
const randomAmount = Math.floor((Math.random() * 100000) + 1);

// https://polkadot.js.org/api/examples/promise/08-transfer-events/
export default async (provider) => {
  const wrapper = createWrapper('08-transfer-events', 'Promise - Transfer Events');
  try {
    // Create our API with a connection to the node
    const api = await ApiPromise.create(provider);
    // create an instance of our testing keyring
    const keyring = testKeyring();
    // get the nonce for Alice account
    const aliceNonce = await api.query.system.accountNonce(ALICE);
    // find the actual keypair in the keyring
    const alicePair = keyring.getPair(ALICE);
    // create a new random recipient
    const recipient = keyring.addFromSeed(randomAsU8a(32)).address();
    createLog(`Sending ${randomAmount} from ${alicePair.address()} to ${recipient} with nonce ${aliceNonce.toString()}`, wrapper);
    // Create a extrinsic, transferring randomAmount units to randomAccount.
    api.tx.balances
      .transfer(recipient, randomAmount)
      .sign(alicePair, aliceNonce)
      .send(({ events = [], status, type }) => {
        // Log transfer events
        createLog(`Transaction status: ${type}`, wrapper);
        if (type === 'Finalised') {
          createLog(`Completed at block hash: ${status.value.toHex()}`, wrapper);
          createLog(`Events:`, wrapper);

          events.forEach(({ phase, event: { data, method, section } }) => {
            createLog(`${phase.toString()}: ${section}.${method} ${data.toString()}`, wrapper);
          });
        }
      });
  } catch (e) {
    createError(e, wrapper);
  }
};