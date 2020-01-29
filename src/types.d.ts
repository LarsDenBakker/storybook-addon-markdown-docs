import { Visitor } from '@babel/core';
import { Statement } from '@babel/types';

export interface MarkdownResult {
  html: string;
  code: Code;
  stories: Story[];
}

export type Code = Statement[];

export interface Story {
  key: string;
  name: string;
  code: Code;
  codeString: string;
}

export type MarkdownToMdxVisitor = Visitor<{
  opts: { code: Code; stories: Story[] };
}>;
