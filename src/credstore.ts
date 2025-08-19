import edge from "edge-js";
import path from "path";
import process from "process";

const credManager = edge.func({
    assemblyFile: path.resolve(process.argv[1]!!, "./dist/CredManagerLib.dll"),
    typeName: "CredManager.Util",
    methodName: "Invoke"
});
credManager(process.argv.slice(2), (error, result) => {
    if (error) {
        throw error;
    } else {
        console.log(result);
    }
});