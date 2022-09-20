import './App.css';
import { useState, useEffect } from 'react';

import { serverAuthorization } from './serverSigner';

const fcl = require("@onflow/fcl");
const t = require("@onflow/types");
fcl.config()
  .put("accessNode.api", "https://rest-mainnet.onflow.org")
  .put("discovery.wallet.method", "POP/RPC")
  .put("challenge.handshake", "https://flow-wallet.blocto.app/authn")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/authn")
  .put("discovery.authn.endpoint", "https://fcl-discovery.onflow.org/api/authn")


const App = () => {
  const [user, setUser] = useState();
  const [services, setServices] = useState([])
  useEffect(() => {
    fcl.discovery.authn.subscribe(res => {
      console.log(res);
      setServices(res.results)
    })
  }, [])



  useEffect(() => {
    fcl.currentUser().subscribe(setUser);
  }, [])

  const setupAccount = async () => {
    const transactionId = await fcl.send([
      fcl.transaction`
      import AFLNFT from 0x01cf0e2f2f715450

      transaction {
          prepare(account: AuthAccount){
              
              let collection <- AFLNFT.createEmptyCollection() as! @AFLNFT.Collection
      
              account.save(<- collection, to: AFLNFT.CollectionStoragePath)
      
              account.link<&{AFLNFT.AFLNFTCollectionPublic}>(
                  AFLNFT.CollectionPublicPath,
                  target: AFLNFT.CollectionStoragePath)
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
      import AFLNFT from 0x01cf0e2f2f715450
      transaction(){
          prepare(acct:AuthAccount){
            let storage <- acct.load<@AFLNFT.Collection>(from: AFLNFT.CollectionStoragePath)
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
      fcl.payer(fcl.authz),
      fcl.proposer(fcl.authz),
      fcl.authorizations([fcl.authz, serverAuthorization]),
      fcl.limit(9999)
    ]).then(fcl.decode);

    console.log(transactionId);
  }
  const getTemplateById = async () => {
    const script = await fcl.send([
      fcl.script(`
      import AFLNFT from 0x01cf0e2f2f715450
      pub fun main(): AFLNFT.Template {
        return AFLNFT.getTemplateById(templateId: 1)
    }
      `)
    ]).then(fcl.decode)
    console.log(script);
  }
  const getNFTDataId = async () => {
    const script = await fcl.send([
      fcl.script(`
      import AFLNFT from 0x01cf0e2f2f715450

    pub fun main() : AnyStruct{    
    var nftData = AFLNFT.getNFTData(nftId: 1)
    

    var templateData =  AFLNFT.getTemplateById(templateId: nftData.templateId)
    var nftMetaData : {String:AnyStruct} = {}

    nftMetaData["templateId"] =nftData.templateId;
    nftMetaData["mintNumber"] =nftData.mintNumber;
    nftMetaData["templateData"] = templateData;

    return nftMetaData
}`)
    ]).then(fcl.decode)
    console.log(script);
  }

  return (
    <div className="App">
      <header className="App-header">
        <div>
          {services.map(service => <button key={service.provider.address} onClick={() => fcl.authenticate({ service })}>Login with {service.provider.name}</button>)}
        </div>
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
          <button onClick={() => { getTemplateById() }}>getTemplateId</button>
          <button onClick={() => { getNFTDataId() }}>getNFT</button>
        </div>
      </header>
    </div>
  );
}

export default App;
