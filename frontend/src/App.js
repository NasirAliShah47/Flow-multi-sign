import './App.css';
import { useState, useEffect } from 'react';

import { serverAuthorization } from './serverSigner';

const fcl = require("@onflow/fcl");
const t = require("@onflow/types");
//Mainnet Configuration
//++++++++++++++++++//============//
// fcl.config()
//   .put("accessNode.api", "https://rest-mainnet.onflow.org")
//   .put("discovery.wallet.method", "POP/RPC")
//   .put("challenge.handshake", "https://flow-wallet.blocto.app/authn")
//   .put("discovery.wallet", "https://fcl-discovery.onflow.org/authn")
//   .put("discovery.authn.endpoint", "https://fcl-discovery.onflow.org/api/authn")

// Flow Testnet Configuration
// =====================//
fcl
  .config()
  .put("flow.network", "testnet")
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
  .put("discovery.authn.endpoint", "https://fcl-discovery.onflow.org/api/authn")
//Alchemy Testnet Configuration
//-====================-
// fcl.config()
//   .put("accessNode.api", "https://flow-testnet.g.alchemy.com")
//   // .put("discovery.wallet.method", "HTTP/POST")
//   .put("grpc.metadata", { "api_key": "m4zkxmleaeozdacbol5yl1dxt3dalthf" })
//   // .put("challenge.handshake", "https://flow-wallet-testnet.blocto.app/authn")
//   .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")
//   .put("discovery.authn.endpoint", "https://fcl-discovery.onflow.org/api/authn")


const App = () => {
  const [user, setUser] = useState();
  const [services, setServices] = useState([])
  useEffect(() => {
    fcl.discovery.authn.subscribe(res => {
      setServices(res.results)
    })
  }, [])



  useEffect(() => {
    fcl.currentUser().subscribe(setUser);
  }, [])

  const setupAccount = async () => {
    const transactionId = await fcl.send([
      fcl.transaction`
      import MyNFT from 0x01cf0e2f2f715450

      transaction {
          prepare(account: AuthAccount){
              
              let collection <- MyNFT.createEmptyCollection() as! @MyNFT.Collection
      
              account.save(<- collection, to: MyNFT.CollectionStoragePath)
      
              account.link<&{MyNFT.MyNFTCollectionPublic}>(
                  MyNFT.CollectionPublicPath,
                  target: MyNFT.CollectionStoragePath)
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
      import MyNFT from 0x01cf0e2f2f715450
      transaction(){
          prepare(acct:AuthAccount){
            let storage <- acct.load<@MyNFT.Collection>(from: MyNFT.CollectionStoragePath)
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

  const singleSignRoyalty = async () => {
    const transactionId = await fcl.send([
      fcl.transaction`
        import FungibleToken from 0x9a0766d93b6608b7
        import MetadataViews from 0x631e88ae7f1d7c20
        
        transaction() {
      
          prepare(signer: AuthAccount) {
      
              // Return early if the account doesn't have a FungibleToken Vault
              if signer.borrow<&FungibleToken.Vault>(from: /storage/flowTokenVault) == nil {
                  panic("A vault for the specified fungible token path does not exist")
              }
      
              // Create a public capability to the Vault that only exposes
              // the deposit function through the Receiver interface
              let capability = signer.link<&{FungibleToken.Receiver, FungibleToken.Balance}>(
                  MetadataViews.getRoyaltyReceiverPublicPath(),
                  target: /storage/flowTokenVault
              )!
      
              // Make sure the capability is valid
              if !capability.check() { panic("Beneficiary capability is not valid!") }
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
      import MyNFT from 0x01cf0e2f2f715450
      pub fun main(): MyNFT.Template {
        return MyNFT.getTemplateById(templateId: 1)
    }
      `)
    ]).then(fcl.decode)
    console.log(script);
  }
  const getNFTDataId = async () => {
    const script = await fcl.send([
      fcl.script(`
      import MyNFT from 0x01cf0e2f2f715450

    pub fun main() : AnyStruct{    
    var nftData = MyNFT.getNFTData(nftId: 1)
    

    var templateData =  MyNFT.getTemplateById(templateId: nftData.templateId)
    var nftMetaData : {String:AnyStruct} = {}

    nftMetaData["templateId"] =nftData.templateId;
    nftMetaData["mintNumber"] =nftData.mintNumber;
    nftMetaData["templateData"] = templateData;

    return nftMetaData
}`)
    ]).then(fcl.decode)
    console.log(script);
  }
  const getSingleNFT = async () => {

    const result = await fcl.query({
      cadence: `
      import AFLNFT from 0xb39a42479c1c2c77

        pub fun main(nftId:UInt64): {UInt64:AnyStruct} {
        var dict : {UInt64: AnyStruct} = {}
        var nftData = AFLNFT.getNFTData(nftId: nftId)
        var templateDataById =  AFLNFT.getTemplateById(templateId: nftData.templateId)
        var nftMetaData : {String:AnyStruct} = {}

        nftMetaData["mintNumber"] = nftData.mintNumber;
        nftMetaData["templateData"] = templateDataById;
        nftMetaData["id"] = nftId;
        dict.insert(key: nftId,nftMetaData)
        return dict
      }
      `,
      args: (arg, t) => [
        arg(String(188), t.UInt64)
      ],
    });
    console.log(result); // 13
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
          <button onClick={() => { getTemplateById() }}>getTemplateId</button>
          <button onClick={() => { getNFTDataId() }}>getNFT</button>
          <button onClick={() => { getSingleNFT() }}>getSingle</button>
          <button onClick={() => { singleSignRoyalty() }}>SetRoyalty</button>

        </div>
      </header>
    </div>
  );
}

export default App;
