import {Configs, CredentialAccess} from "./types";
import {execute} from "./exec";

class CommandLine implements CredentialAccess {
    constructor(private readonly command: string, private readonly config: Configs[number]) {
    }

    async delete(service: string, username: string): Promise<void> {
        return this.execute("delete", {service, username}).then();
    }

    get(service: string, username: string): Promise<string> {
        return this.execute("get", {service, username}) as Promise<string>;
    }

    async set(service: string, username: string, password: string): Promise<void> {
        return this.execute("set", {service, username, password}).then();
    }

    private execute(action: string, vars: Record<string, string>): Promise<string | void> {
        if (!("actions" in this.config)) {
            throw new Error();
        }
        const {command, config: {actions: {[action]: config}}} = this;

    }

    static create(home: string, match: string, config: Configs[number]): Promise<CredentialAccess> {
        return Promise.resolve(new CommandLine(match, config));
    }
}

export {
    CommandLine
};
