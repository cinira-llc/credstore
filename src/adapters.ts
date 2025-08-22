import {Adapters} from "./types";

const selectAdapter = async (config: Adapters, env: NodeJS.Dict<string>, command: (name: string) => Promise<string | undefined>) => {
    console.log(config);
}

export {
    selectAdapter
};
