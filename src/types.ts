interface CredentialAccess {
    delete(service: string, username: string): Promise<void>;

    get(service: string, username: string): Promise<string>;

    set(service: string, username: string, password: string): Promise<void>;
}

interface Adapter {
    delete(service: string, username: string): Promise<void>;

    get(service: string, username: string): Promise<string>;

    set(service: string, username: string, password: string): Promise<void>;
}

type Adapters = Record<string, {
    adapter: "CommandLine",
    match: string,
    actions: {
        delete: string[]
        get: string[]
        set: string[]
    }
} | {
    adapter: "WindowsCredentialManager"
    match: string
}>;

export {
    Adapter,
    Adapters,
    CredentialAccess
};
