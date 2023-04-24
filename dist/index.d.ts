declare function installScopedCSS(registry: any): void;
declare function buildASTPlugin(): {
    name: string;
    plugin: import("@glimmer/syntax").ASTPluginBuilder<{
        meta: object & {
            jsutils: import("babel-plugin-ember-template-compilation").JSUtils;
        };
    } & import("@glimmer/syntax").ASTPluginEnvironment & {
        filename: string;
        contents: string;
        strict?: boolean | undefined;
        locals?: string[] | undefined;
    }>;
    baseDir: () => string;
    parallelBabel: {
        requireFile: string;
        buildUsing: string;
        params: {};
    };
};
export { installScopedCSS, buildASTPlugin };
//# sourceMappingURL=index.d.ts.map