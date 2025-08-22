import fs from "fs";
import path from "path";
import {selectAdapter} from "../src/adapters";
import {Adapters} from "../src/types";

describe("adapters.ts", () => {
    describe("selectAdapter()", () => {
        it("should select the Windows Credential Manager adapter when ENV[OS] is Windows_NT", async () => {
            const adapters = (await fs.promises.readFile(path.resolve(__dirname, "../src/adapters.json"))).toString("utf-8");
            console.log(adapters);
            // const adapter = await selectAdapter(JSON.parse(adapters), {"OS": "Windows_NT"});
            // expect(adapter).toBeDefined();
        });
    });
});
