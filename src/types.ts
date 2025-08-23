/**
 * Adapter to a credential store.
 */
interface Adapter {
    delete(service: string, username: string): Promise<void>;

    get(service: string, username: string): Promise<string>;

    set(service: string, username: string, password: string): Promise<void>;
}

type Configs = Array<AdapterConfig>;

interface CommandLineConfig {
    adapter: "CommandLine",
    match: string,
    args: {
        delete: string[]
        get: string[]
        set: string[]
    }
}

interface WindowsCredentialManagerConfig {
    adapter: "WindowsCredentialManager",
    match: string
}

function isCommandLineConfig(config: any): config is CommandLineConfig {
    return "object" === typeof config
        && "adapter" in config
        && "CommandLine" === config.adapter;
}

function isWindowsCredentialManagerConfig(config: any): config is WindowsCredentialManagerConfig {
    return "object" === typeof config
        && "adapter" in config
        && "WindowsCredentialManager" === config.adapter;
}

type AdapterConfig =
    | CommandLineConfig
    | WindowsCredentialManagerConfig;

/* Module exports. */
export {
    Adapter,
    AdapterConfig,
    Configs,
    isCommandLineConfig,
    isWindowsCredentialManagerConfig
};
