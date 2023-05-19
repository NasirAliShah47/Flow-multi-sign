export const GET_SINGLE_NFT = `
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
`
