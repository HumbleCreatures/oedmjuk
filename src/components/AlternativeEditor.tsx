import { Alert, Button, TextInput, Title, createStyles, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons";
import { api } from "../utils/api";
import { ARichTextEditor, VoidFunc } from "./RichTextEditor";
import { useRef } from "react";

const useStyles = createStyles((theme) => ({
  area: {
    backgroundColor: theme.colors.gray[4],
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  bodyArea: {
    backgroundColor: theme.white,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  areaTitle: {
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.xs,
  },
  mainTitle: {
    color: theme.white,
    fontSize: theme.fontSizes.xxl,
    marginTop: theme.spacing.xl,
  },
  editorWrapper: {
    marginTop: theme.spacing.md,
  },
  inlineText: {
    display: "inline",
  },
}));


export function AlternativeEditor({ selectionId }: { selectionId: string }) {
  const { classes } = useStyles();
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
      <form
        onSubmit={form.onSubmit((values) => {
          mutation.mutate({ ...values, selectionId });
          clearForm.current?.();
        })}
      >
        <Title order={2} className={classes.areaTitle}>
          Create alternative
        </Title>
        <TextInput
            label="Title"
            placeholder="Title"
            {...form.getInputProps("title")}
          />
          
          <div className={classes.editorWrapper}>
              <Text fz="sm" fw={500}>
                Body
              </Text>
        {clearForm  !== undefined && <ARichTextEditor
          onUpdate={(html) => form.setFieldValue("body", html)}
          clearForm={clearForm}
        /> }
        </div>

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
  );
}
