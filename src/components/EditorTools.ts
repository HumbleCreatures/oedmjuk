import Table from '@editorjs/table'
import Paragraph from '@editorjs/paragraph'
import List from '@editorjs/list'
import Warning from '@editorjs/warning'
import Code from '@editorjs/code'
import LinkTool from '@editorjs/link'
import Header from '@editorjs/header'
import Quote from '@editorjs/quote'
import Marker from '@editorjs/marker'
import CheckList from '@editorjs/checklist'
import Delimiter from '@editorjs/delimiter'
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