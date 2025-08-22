import path from "path";
import {CredentialAccess} from "./types";

class WindowsCredentialManager implements CredentialAccess {
    constructor(private readonly home: string) {
    }

    delete(service: string, username: string): Promise<void> {
        return Promise.resolve();
    }

    get(service: string, username: string): Promise<string> {
        return Promise.resolve("");
    }

    set(service: string, username: string, password: string): Promise<void> {
        return Promise.resolve();
    }
}

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
    runWindows,
    WindowsCredentialManager
};
