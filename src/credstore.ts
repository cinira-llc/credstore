import path from "path";
import edge from "edge-js";

const credManager = edge.func({
    assemblyFile: path.join(process.argv[1]!!, "dist/CredManagerLib.dll"),
    typeName: "CredManager.EdgeJsMethods",
    methodName: "Invoke"
});
credManager("Hello from Edge.js", (error, result) => {
    if (error) {
        throw error;
    } else {
        console.dir(result);
    }
});