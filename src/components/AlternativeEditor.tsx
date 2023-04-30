import { Alert, Button, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons";
import { api } from "../utils/api";
import { ARichTextEditor, VoidFunc } from "./RichTextEditor";
import { useRef } from "react";

export function AlternativeEditor({ selectionId }: { selectionId: string }) {
  const clearForm = useRef<VoidFunc>();

  const form = useForm({
    initialValues: {
      title: "",
      body: "",
    },
    validate: {
      title: (value) => (value.length < 3 ? "Title must have at least 3 letters" : null),
      body: (value) =>
        value.length < 10 ? "Name must have at least 10 letters" : null,
    },
  });

  const utils = api.useContext();
  const mutation = api.selection.addAlternative.useMutation({
    onSuccess() {
      void utils.selection.getSelection.invalidate({ selectionId });
    },
  });

  
  return (
    <div>
      <form
        onSubmit={form.onSubmit((values) => {
          mutation.mutate({ ...values, selectionId });
          clearForm.current?.();
        })}
      >
        <h1>Create objection</h1>
        <TextInput
            label="Title"
            placeholder="Title"
            {...form.getInputProps("title")}
          />
          
        {clearForm  !== undefined && <ARichTextEditor
          onUpdate={(html) => form.setFieldValue("body", html)}
          clearForm={clearForm}
        /> }

        <Button type="submit" mt="sm">
          Create alternative
        </Button>

        {mutation.error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Bummer!"
            color="red"
          >
            Something went wrong! {mutation.error.message}
          </Alert>
        )}
      </form>
    </div>
  );
}
