import './App.css';
import { useState, useEffect } from 'react';

import { serverAuthorization } from './serverSigner';

const fcl = require("@onflow/fcl");
const t = require("@onflow/types");
fcl.config()
  .put("accessNode.api", "https://testnet.onflow.org")
  .put("discovery.wallet", "https://flow-wallet-testnet.blocto.app/authn");

const App = () => {
  const [user, setUser] = useState();

  useEffect(() => {
    fcl.currentUser().subscribe(setUser);
  }, [])

  const setupAccount = async () => {
    const transactionId = await fcl.send([
      fcl.transaction`
      import XGStudio from 0xff321cc072da62b3
      transaction {
        prepare(acct: AuthAccount) {

        let collection  <- XGStudio.createEmptyCollection()
        // store the empty NFT Collection in account storage
        acct.save( <- collection, to:XGStudio.CollectionStoragePath)
        log("Collection created for account".concat(acct.address.toString()))
        // create a public capability for the Collection
        acct.link<&{XGStudio.XGStudioCollectionPublic}>(XGStudio.CollectionPublicPath, target:XGStudio.CollectionStoragePath)        
      }   
    }
    `,
      fcl.payer(fcl.authz),
      fcl.proposer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.limit(9999)
    ]).then(fcl.decode);

    console.log(transactionId);
  }

  const destroyAccount = async () => {
    const transactionId = await fcl.send([
      fcl.transaction`
      import XGStudio from 0xff321cc072da62b3
      transaction(){
          prepare(acct:AuthAccount){
            let storage <- acct.load<@XGStudio.Collection>(from: XGStudio.CollectionStoragePath)
                      ??panic("could not load")
            destroy storage

      }
}
      `,
      fcl.payer(fcl.authz),
      fcl.proposer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.limit(9999)
    ]).then(fcl.decode);

    console.log(transactionId);
  }
  const singleSign = async () => {
    const transactionId = await fcl.send([
      fcl.transaction`
      transaction() {
        prepare(frontendUser: AuthAccount) {

        }
      }
      `,
      fcl.payer(fcl.authz),
      fcl.proposer(fcl.authz),
      fcl.authorizations([fcl.authz]),
      fcl.limit(9999)
    ]).then(fcl.decode);

    console.log(transactionId);
  }


  const multiSign = async () => {
    const transactionId = await fcl.send([
      fcl.transaction`
      transaction() {
        prepare(frontendUser: AuthAccount, backendAdmin: AuthAccount) {

        }
      }
      `,
      fcl.payer(serverAuthorization),
      fcl.proposer(fcl.authz),
      fcl.authorizations([fcl.authz, serverAuthorization]),
      fcl.limit(9999)
    ]).then(fcl.decode);

    console.log(transactionId);
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>{user && user.addr ? user.addr : "Not logged in."}</h1>
        <div>
          <button onClick={() => fcl.authenticate()}>Log In</button>
          <button onClick={() => fcl.unauthenticate()}>Log Out</button>
        </div>
        <button onClick={() => singleSign()}>Run Single-Sign Tx</button>
        <button onClick={() => multiSign()}>Run Multi-Sign Tx</button>
        <div>
          <button onClick={() => { setupAccount() }}>Run Setup Account Tx</button>
          <button onClick={() => { destroyAccount() }}>Run Destroy Account Tx</button>
        </div>
      </header>
    </div>
  );
}

export default App;
