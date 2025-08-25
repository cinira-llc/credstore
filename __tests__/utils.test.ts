import {commandExists, evaluate, findHome} from "../src/utils";

describe('utils.ts', () => {
    describe("commandExists()", () => {
        it("should return false for a command that does not exist", async () => {
            expect(await commandExists("nonexistent-command")).toBe(false);
        });
        it("should return true for a command that exists", async () => {
            expect(await commandExists("whoami")).toBe(true);
        });
    });
    describe("evaluate()", () => {
        it("should evaluate a simple expression", () => {
            expect(evaluate("1 + 1")).toBe(2);
        });
        it("should evaluate expressions with variables", () => {
            expect(evaluate("a + b", {a: 123, b: 456})).toBe(579);
        });
        it("should call functions", () => {
            expect(evaluate("add456(a)", {add456: (v: number) => v + 456, a: 123})).toBe(579);
        });
    });
    describe("findHome()", () => {
        it("should find the home directory", async () => {
            const home = await findHome("node");
            expect(home).toBe(process.cwd());
        });
    });
});
