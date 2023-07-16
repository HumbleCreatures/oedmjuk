/* eslint-disable */
import type { OutputData } from "@editorjs/editorjs";
import React from "react";

//use require since editorjs-html doesn't have types
const editorJsHtml = require("editorjs-html");
const EditorJsToHtml = editorJsHtml();

type Props = {
  data: string;
};
type ParsedContent = string | JSX.Element;

const EditorJsRenderer = ({ data }: Props) => {
  let parsedData: OutputData | undefined;
  let html: ParsedContent[] = [];
  try { 
    parsedData = JSON.parse(data) as OutputData;
    html = EditorJsToHtml.parse(parsedData) as ParsedContent[];
  } catch(e) {
    return <div className="prose max-w-full">
          <div dangerouslySetInnerHTML={{ __html: data }}></div>
  </div>
  }
  
  return (
    //✔️ It's important to add key={data.time} here to re-render based on the latest data.
    <div className="prose max-w-full" key={parsedData.time}>
      {html.map((item, index) => {
        if (typeof item === "string") {
          return (
            <div dangerouslySetInnerHTML={{ __html: item }} key={index}></div>
          );
        }
        return item;
      })}
    </div>
  );
};

export default EditorJsRenderer;
