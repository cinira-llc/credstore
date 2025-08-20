import path from "path";

const runWindows = (home: string, args: string[]) => {
    const edge = require("edge-js");
    const credManager = edge.func({
        assemblyFile: path.resolve(home, "./CredManagerLib/bin/Release/net48/CredManagerLib.dll"),
        typeName: "CredManager.Util",
        methodName: "Invoke"
    });
    credManager(args, (error: any, result: any) => {
        if (error) {
            throw error;
        } else {
            console.log(result);
        }
    });
}

export {
    runWindows
};
