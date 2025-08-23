import fs from "fs";
import path from "path";
import {Adapters} from "../src/adapters";
import {findHome} from "../src/utils";
import {WindowsCredentialManager} from "../src/windows";
import {Configs} from "../src/types";
import {CommandLine} from "../src/unix";

describe("adapters.ts", () => {
    describe("Adapters", () => {
        describe("select()", () => {
            it("should select the Windows Credential Manager adapter when ENV[OS] is Windows_NT", async () => {
                const home = await findHome(process.cwd());
                const configs: Configs = JSON.parse((await fs.promises.readFile(path.resolve(__dirname, "../src/adapters.json"))).toString("utf-8"));
                const instance = new Adapters(home, configs, {"OS": "Windows_NT"}, () => {
                    throw new Error("Not implemented");
                });
                const adapter = await instance.select();
                expect(adapter).toBeInstanceOf(WindowsCredentialManager);
            });
            it("should select CommandLine adapter wrapping 'security' on macOS", async () => {
                const home = await findHome(process.cwd());
                const configs: Configs = JSON.parse((await fs.promises.readFile(path.resolve(__dirname, "../src/adapters.json"))).toString("utf-8"));
                const instance = new Adapters(home, configs, {}, name => {
                    if ("security" === name) {
                        return Promise.resolve("found security!");
                    }
                    return Promise.resolve(undefined);
                });
                const adapter = await instance.select();
                expect(adapter).toBeInstanceOf(CommandLine);
            });
        });
    });
});
