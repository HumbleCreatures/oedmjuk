/* eslint-disable */
// @ts-ignore
import Table from '@editorjs/table';
// @ts-ignore
import Paragraph from '@editorjs/paragraph'
// @ts-ignore
import List from '@editorjs/list'
// @ts-ignore
import Warning from '@editorjs/warning'
// @ts-ignore
import Code from '@editorjs/code'
// @ts-ignore
import LinkTool from '@editorjs/link'
// @ts-ignore
import Header from '@editorjs/header'
// @ts-ignore
import Quote from '@editorjs/quote'
// @ts-ignore
import Marker from '@editorjs/marker'
// @ts-ignore
import CheckList from '@editorjs/checklist'
// @ts-ignore
import Delimiter from '@editorjs/delimiter'
// @ts-ignore
import InlineCode from '@editorjs/inline-code'

export const EDITOR_TOOLS = {
    // NOTE: Paragraph is default tool. Declare only when you want to change paragraph option.
    // paragraph: Paragraph,
    table: Table,
    list: List,
    warning: Warning,
    code: Code,
    linkTool: LinkTool,
    header: Header,
    quote: Quote,
    marker: Marker,
    checklist: CheckList,
    delimiter: Delimiter,
    inlineCode: InlineCode,
}