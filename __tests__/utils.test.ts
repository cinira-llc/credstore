import {evaluate, findCommand, findHome} from "../src/utils";

describe('utils.ts', () => {
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
    describe("findCommand()", () => {
        it("should return undefined if the command does not exist", () => {
            expect(findCommand("nonexistent-command")).resolves.toBeUndefined();
        });
        it("should return the command path if the command exists", () => {
            expect(findCommand("ls")).resolves.toMatch(/\/ls(\.exe)?$/);
        });
    });
});
