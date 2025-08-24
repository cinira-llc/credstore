import path from "path";

import {execute} from "./exec";
import {evaluate, findExecutable, findHome} from "./utils";

/**
 * Edge.js delegate to the Windows Credential Manager, see `CredManager.cs`.
 */
type CredentialManagerDelegate = (args: string[], callback: (error: any, result: any) => void) => void;

/**
 * Lookup function for CLI commands.
 */
type CommandLookup = (command: string) => Promise<string | undefined>;

type Action = "delete" | "get" | "set";

/**
 * Adapter to a credential store.
 */
interface Adapter {
    delete(service: string, username: string): Promise<void>;

    get(service: string, username: string): Promise<string>;

    set(service: string, username: string, password: string): Promise<void>;
}

interface CLIAdapterConfig {
    executable: string;
    actions: Record<Action, {
        args: string[];
        stdin?: string;
    }>;
}

class CLIAdapter implements Adapter {
    constructor(private readonly config: CLIAdapterConfig) {
    }

    async delete(service: string, username: string): Promise<void> {
        const {executable, actions: {delete: action}} = this.config;
        return this.execute(this.config.actions.delete, {service, username}).then();
    }

    async get(service: string, username: string): Promise<string> {
        return this.execute(this.config.actions.get, {service, username}).then(result => result as string);
    }

    async set(service: string, username: string, password: string): Promise<void> {
        return this.execute(this.config.actions.set, {service, username, password}).then();
    }

    private execute(action: CLIAdapterConfig["actions"][Action], params: Record<string, string>): Promise<string | void> {
        const {executable} = this.config;
        const args = action.args.map(arg => evaluate(`\`${arg}\``, params));
        return new Promise((resolve, reject) => {
            const {stdin} = action;
            execute(executable, args, null == stdin ? undefined : evaluate(`\`${stdin}\``, params))
                .then(({code, stderr, stdout}) => {
                    if (0 === code) {
                        resolve(undefined === stdout ? undefined : stdout.toString("utf-8").trim());
                        return;
                    }
                    const message = undefined === stderr ?
                        `Command [${executable}] exited with code ${code}.` :
                        `Command [${executable}] exited with code ${code}: ${stderr.toString("utf-8").trim()}`;
                    reject(new Error(message));
                });
        });
    }
}

/**
 * Adapter to the Windows Credential Manager.
 */
class CredentialManagerAdapter implements Adapter {
    private get delegate(): Promise<CredentialManagerDelegate> {
        const edge = require("edge-js");
        return Promise.resolve(edge.func({
            assemblyFile: path.resolve(this.home, "./CredManagerLib/bin/Release/net48/CredManagerLib.dll"),
            typeName: "CredManager.Util",
            methodName: "Invoke"
        }));
    }

    constructor(private readonly home: string) {
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

    private async execute(...args: string[]): Promise<string | void> {
        const delegate = await this.delegate;
        return new Promise((resolve, reject) => {
            delegate(args, (error: any, result: any) => {
                if (null != error) {
                    reject(error);
                    return;
                }
                resolve(result);
            });
        })
    }
}

class Adapters {
    constructor(
        private readonly home: string,
        private readonly env: NodeJS.Dict<string>,
        private readonly lookup: CommandLookup
    ) {
    }

    async select(): Promise<Adapter> {
        if ((this.env["OS"] || "").startsWith("Windows_")) {
            return new CredentialManagerAdapter(this.home);
        }
        const {lookup} = this;
        for (const [command, config] of Object.entries(cliAdapterConfigsByCommand)) {
            const executable = await lookup(command);
            if (!!executable) {
                return Promise.resolve(new CLIAdapter({executable, ...config}));
            }
        }
        throw new Error("Unable to locate a supported credential store.");
    }

    static async create() {
        const home = await findHome(process.cwd());
        return new Adapters(home, process.env, findExecutable);
    }
}

/**
 * Configurations for supported command line credential access tools.
 */
const cliAdapterConfigsByCommand: Record<string, Omit<CLIAdapterConfig, "executable">> = {

    /* Ubuntu secret-tool. */
    "secret-tool": {
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
            }
        }
    },

    /* macOS security. */
    "security": {
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
    }
}

/* Module exports. */
export {
    Adapter,
    Adapters,
    CLIAdapter,
    CredentialManagerAdapter
};
