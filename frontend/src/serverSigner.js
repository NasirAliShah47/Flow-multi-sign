import * as fcl from "@onflow/fcl";

const API = "http://localhost:5000";

const getSignature = async (signable) => {
  const response = await fetch(`${API}/sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signable })
  });

  const signed = await response.json();
  return signed.signature;
}

export const serverAuthorization = async (account) => {

  const addr = "0x46e63ea8da5c4335";
  const keyId = 0;

  return {
    ...account,
    tempId: `${addr}-${keyId}`,
    addr: fcl.sansPrefix(addr),
    keyId: Number(keyId),
    signingFunction: async (signable) => {

      const signature = await getSignature(signable);

      return {
        addr: fcl.withPrefix(addr),
        keyId: Number(keyId),
        signature
      }
    }
  }
}