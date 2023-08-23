//./components/Editor
import React, { useEffect, useRef } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import { EDITOR_TOOLS } from "./EditorTools";

//props
export enum ClearTriggerValues {
  clear = 'clear',
  clearAgain = 'clearAgain'
}

export type BlockEditorInput = {
  data?: OutputData;
  onChange(val: OutputData): void;
  holder: string;
  clearTrigger?: ClearTriggerValues;
};

export const BlockEditor = ({ data, onChange, holder, clearTrigger }: BlockEditorInput) => {
  //add a reference to editor
  const editorRef = useRef<EditorJS>();

  const [currentData, setCurrentData] = React.useState<OutputData | undefined>(undefined);
  useEffect(() => {
    console.log("TRIGGER SHOULD BE CALLED", clearTrigger);
    if (clearTrigger && editorRef.current && editorRef.current?.clear) {     
      editorRef.current.clear();
    }
  }, [clearTrigger]);
  //initialize editorjs
  useEffect(() => {
    //initialize editor if we don't have a reference
    setCurrentData(data);
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: holder,
        tools: EDITOR_TOOLS,
        minHeight: 150,
        data,
        async onChange(api, event) {
          const data = await api.saver.save();
          onChange(data);
        },
      });
      
      editorRef.current = editor;
    }

    //add a return function handle cleanup
    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => { 
    if (editorRef.current && editorRef.current.render && data) {
      if(!currentData) {
        setCurrentData(data);
        void editorRef.current.render(data);
      }
      
    }
  }, [data, currentData]);


  return <div id={holder} />;
};

function AnotherBlockEditor(props: BlockEditorInput) {
return <div style={{borderColor: '#ced4da', borderWidth: 1, borderStyle: 'solid', borderRadius: '0.25rem', paddingLeft: 10, paddingRight: 10 }}>
  <BlockEditor {...props} />
</div>
}
export default AnotherBlockEditor;




