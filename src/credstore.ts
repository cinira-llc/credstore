import fs from "fs";
import path from "path";

console.log("Credstore module initialized.");

const dll = path.join(process.argv[1]!!, "dist/CredManagerLib.dll");

const credManager = edge.func({
    assemblyFile: dll,
    typeName: "CredManagerLib.CredManager",
    methodName: "GetUserCredential"
});
console.log("CredManagerLib loaded from", dll);