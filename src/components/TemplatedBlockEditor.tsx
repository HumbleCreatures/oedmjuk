//./components/Editor
import React, { useEffect } from "react";
import { BlockEditor, BlockEditorInput } from "./BlockEditor";
import { Select, Button, Group, createStyles } from "@mantine/core";
import { OutputData } from "@editorjs/editorjs";
import { api } from "../utils/api";

const useStyles = createStyles((theme) => ({
  templateGroup: {
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
}));

function TemplatedBlockEditor({ data, onChange, holder }: BlockEditorInput) {
  const query = api.bodyTemplate.getAllSelectableTemplates.useQuery();
  const selectableTemplates =
    query.data?.map((t) => ({ value: t.id, label: t.name })) ?? [];
  const { classes } = useStyles();
  const [selectedTemplate, setSelectedTemplate] = React.useState<
    | { id: string; name: string | undefined; body: OutputData | undefined }
    | undefined
  >(undefined);

  const [currentData, setCurrentData] = React.useState<OutputData | undefined>(undefined);

  useEffect(() => { 
    setCurrentData(data);
  }, [data]);

  function applyTemplate() {
    console.log('apply template')
    if (selectedTemplate) {
      setCurrentData(selectedTemplate.body);
    }
  }

  return (
    <div>
      <div>
        <Group className={classes.templateGroup}>
          <Select
            placeholder="Select template to apply"
            searchable
            nothingFound="No options"
            data={selectableTemplates}
            clearable
            onChange={(selectedValue) => {
              if(!selectedValue) {
                setSelectedTemplate(undefined);
                return;
              }
              const template = query.data?.find((t) => t.id === selectedValue);
              if (template) {
                setSelectedTemplate({
                  id: template.id,
                  name: template.name,
                  body: JSON.parse(template.body as string) as OutputData,
                });
              } 
            }}
          />
          <Button disabled={selectedTemplate === undefined} onClick={() =>applyTemplate()}>Apply</Button>
        </Group>
      </div>
      <div
        style={{
          borderColor: "#ced4da",
          borderWidth: 1,
          borderStyle: "solid",
          borderRadius: "0.25rem",
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        <BlockEditor data={currentData} onChange={onChange} holder={holder} />
      </div>
    </div>
  );
}
export default TemplatedBlockEditor;
