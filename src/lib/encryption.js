import forge from "node-forge"

const encrypt = (input, pubKey) => {
  const publicKeyObj = forge.pki.publicKeyFromPem(pubKey)
  const encryptedBytes = publicKeyObj.encrypt(input, "RSA-OAEP", {
    md: forge.md.sha1.create(),
    mgf1: {
      md: forge.md.sha1.create(),
    },
  })

  const encrypted = forge.util.encode64(encryptedBytes)
  return encrypted
}

export default encrypt
