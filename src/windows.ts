import edge from "edge-js";
import path from "path";

function runWindows(home: string, args: string[]) {
    const credManager = edge.func({
        assemblyFile: path.resolve(home, "./CredManagerLib/bin/Release/net48/CredManagerLib.dll"),
        typeName: "CredManager.Util",
        methodName: "Invoke"
    });
    credManager(args, (error, result) => {
        if (error) {
            throw error;
        } else {
            console.log(result);
        }
    });
}

export default runWindows;
