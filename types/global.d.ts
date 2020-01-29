declare module '@mdx-js/mdx' {
  export = function mdx(markdown: string, options: { compilers: any[], filepath: string }): Promise<string>;
}

declare module '@mdx-js/mdx/mdx-hast-to-jsx' {

}