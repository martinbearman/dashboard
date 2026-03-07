/**
 * Document builder block types and payloads.
 * Used for the document builder module (headings, paragraphs, bullets, tables, images).
 */

export type DocumentBlockType = "heading" | "paragraph" | "bullets" | "table" | "image";

export interface BaseBlock {
  id: string;
  type: DocumentBlockType;
}

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  level: 1 | 2 | 3;
  text: string;
}

export interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  text: string;
}

export interface BulletsBlock extends BaseBlock {
  type: "bullets";
  items: string[];
}

export interface TableBlock extends BaseBlock {
  type: "table";
  headers: string[];
  rows: string[][];
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  url: string;
  alt?: string;
  caption?: string;
}

export type DocumentBlock =
  | HeadingBlock
  | ParagraphBlock
  | BulletsBlock
  | TableBlock
  | ImageBlock;
