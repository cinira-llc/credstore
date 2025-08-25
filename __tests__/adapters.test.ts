import {Adapters, CLIAdapter, CredentialManagerAdapter} from "../src/adapters";
import {findHome} from "../src/utils";

describe("adapters.ts", () => {
    describe("Adapters", () => {
        describe("select()", () => {
            it("should select CredentialManagerAdapter when ENV[OS] is Windows_NT", async () => {
                const home = await findHome(process.cwd());
                const instance = new Adapters(home, {"OS": "Windows_NT"}, () => Promise.reject(new Error("Should not be called")));
                const adapter = await instance.select();
                expect(adapter).toBeInstanceOf(CredentialManagerAdapter);
            });
            it("should select CLIAdapter wrapping 'security' on macOS", async () => {
                const home = await findHome(process.cwd());
                const instance = new Adapters(home, {}, name => {
                    if ("security" === name) {
                        return Promise.resolve("found security!");
                    }
                    return Promise.resolve(undefined);
                });
                const adapter = await instance.select();
                expect(adapter).toBeInstanceOf(CLIAdapter);
            });
            it("should select CLIAdapter wrapping 'secret-tool' on Ubuntu", async () => {
                const home = await findHome(process.cwd());
                const instance = new Adapters(home, {}, name => {
                    if ("secret-tool" === name) {
                        return Promise.resolve("found secret-tool!");
                    }
                    return Promise.resolve(undefined);
                });
                const adapter = await instance.select();
                expect(adapter).toBeInstanceOf(CLIAdapter);
            });
        });
    });
});
