import path from "path";
import type {Configs, Adapter} from "./types";
import {evaluate, findExecutable, findHome} from "./utils";

/**
 * Edge.js delegate to the Windows Credential Manager, see `CredManager.cs`.
 */
type CredentialManagerDelegate = (args: string[], callback: (error: any, result: any) => void) => void;

interface CommandLineConfig {
    executable: string;
    actions: Record<"delete" | "get" | "set", {
        args: string[];
        stdin?: string;
    }>;
}

class CommandLineAdapter implements Adapter {
    constructor(private readonly config: CommandLineConfig) {
    }

    delete(service: string, username: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    get(service: string, username: string): Promise<string> {
        return Promise.resolve("");
    }

    set(service: string, username: string, password: string): Promise<void> {
        return Promise.resolve(undefined);
    }
}

/**
 * Adapter to the Windows Credential Manager.
 */
class CredentialManagerAdapter implements Adapter {
    constructor(private readonly delegate: CredentialManagerDelegate) {
    }

    async delete(service: string, username: string): Promise<void> {
        return this.execute("delete", service, username).then();
    }

    async get(service: string, username: string): Promise<string> {
        const result = await this.execute("get", service, username);
        return (result as string);
    }

    async set(service: string, username: string, password: string): Promise<void> {
        return this.execute("set", service, username, password).then();
    }

    private execute(...args: string[]): Promise<string | void> {
        return new Promise((resolve, reject) => {
            this.delegate(args, (error: any, result: any) => {
                if (null != error) {
                    reject(error);
                    return;
                }
                resolve(result);
            });
        })
    }

    static create(home: string): Promise<CredentialManagerAdapter> {
        const edge = require("edge-js");
        return Promise.resolve(new CredentialManagerAdapter(edge.func({
            assemblyFile: path.resolve(home, "./CredManagerLib/bin/Release/net48/CredManagerLib.dll"),
            typeName: "CredManager.Util",
            methodName: "Invoke"
        })));
    }
}

class Adapters {
    constructor(
        private readonly home: string,
        private readonly configs: Configs,
        private readonly env: NodeJS.Dict<string>,
        private readonly commands: (name: string) => Promise<string | undefined>
    ) {
    }

    async select(): Promise<Adapter> {
        if ((this.env["OS"] || "").startsWith("Windows_")) {
            return CredentialManagerAdapter.create(this.home);
        }
        const {commands} = this;
        for (const command in ["security", "secret-tool"]) {
            const executable = await commands(command);
            if (!!executable) {
                switch (command) {
                    case "secret-tool":
                        return Promise.resolve(new CommandLineAdapter({
                            actions: {
                                delete: {
                                    args: ["clear", "service", "${service}", "username", "${username}"]
                                },
                                get: {
                                    args: ["lookup", "service", "${service}", "username", "${username}"]
                                },
                                set: {
                                    args: ["store", "--label", "${service}/${username}", "service", "${service}", "username", "${username}"],
                                    stdin: "${password}"
                                },
                            },
                            executable
                        }));
                    case "security":
                        return Promise.resolve(new CommandLineAdapter({
                            actions: {
                                delete: {
                                    args: ["delete-generic-password", "-s", "${service}", "-a", "${username}"]
                                },
                                get: {
                                    args: ["find-generic-password", "-s", "${service}", "-a", "${username}", "-w"]
                                },
                                set: {
                                    args: ["add-generic-password", "-s", "${service}", "-a", "${username}", "-w", "${password}"]
                                }
                            },
                            executable
                        }));
                }
            }
        }
        throw new Error("Unable to locate a supported credential store.");
    }

    static async create() {
        const home = await findHome(process.cwd());
        return new Adapters(home, [], process.env, findExecutable);
    }
}

export {
    Adapters
};
