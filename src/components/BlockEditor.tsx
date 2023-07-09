//./components/Editor
import React, { useEffect, useRef } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import { EDITOR_TOOLS } from "./EditorTools";

//props
export type BlockEditorInput = {
  data?: OutputData;
  onChange(val: OutputData): void;
  holder: string;
};

export const BlockEditor = ({ data, onChange, holder }: BlockEditorInput) => {
  //add a reference to editor
  const ref = useRef<EditorJS>();


  //initialize editorjs
  useEffect(() => {
    //initialize editor if we don't have a reference
    if (!ref.current) {
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
      
      ref.current = editor;
    }

    //add a return function handle cleanup
    return () => {
      if (ref.current && ref.current.destroy) {
        ref.current.destroy();
      }
    };
  }, []);

  useEffect(() => { 
    if (ref.current && ref.current.render && data) {
      console.log('rendering data', typeof data);
      void ref.current.render(data);
    }
  }, [data]);


  return <div id={holder} />;
};

function AnotherBlockEditor({ data, onChange, holder }: BlockEditorInput) {
return <div style={{borderColor: '#ced4da', borderWidth: 1, borderStyle: 'solid', borderRadius: '0.25rem', paddingLeft: 10, paddingRight: 10 }}>
  <BlockEditor data={data} onChange={onChange} holder={holder} />
</div>
}
export default AnotherBlockEditor;




