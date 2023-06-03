import { RichTextEditor } from "@mantine/tiptap";
import { Button, Container, TextInput, createStyles, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { api } from "../utils/api";

const useStyles = createStyles((theme) => ({

  areaTitle: {
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.xs,
  },
  editorContainer: {
    width: 300,
  }
 
}));

export function FeedbackItemEditor({feedbackRoundId}: {feedbackRoundId: string}) {
  const { classes } = useStyles();
  const form = useForm({
    initialValues: {
      title: "",
      body: "",
    },
    validate: {
      title: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
    },
  });

  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: 'This is placeholder' })],
    content: '',
    onUpdate({ editor }) {
      form.setFieldValue('body', editor.getHTML())
    },
  });

  const utils = api.useContext();
  const mutation = api.feedback.createFeedbackItem.useMutation({
    onSuccess() {
      void utils.feedback.getFeedbackRound.invalidate({ itemId: feedbackRoundId});
      void utils.feedback.getMyFeedbackItems.invalidate({ itemId: feedbackRoundId});
      void utils.feedback.getExternalFeedbackItems.invalidate({ itemId: feedbackRoundId});
    },
  });

  return (
    <Container className={classes.editorContainer}>
        <Title order={3} className={classes.areaTitle}>
              Create feedback item
            </Title>
        <form
        onSubmit={form.onSubmit((values) => {
          mutation.mutate({ ...values, feedbackRoundId })
        })}
      >
        <TextInput
          label="Title"
          placeholder="Title"
          {...form.getInputProps("title")}
        />
        <div>Body</div>
        <RichTextEditor editor={editor}>
          <RichTextEditor.Toolbar sticky stickyOffset={60}>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Strikethrough />
              <RichTextEditor.ClearFormatting />
              <RichTextEditor.Highlight />
              <RichTextEditor.Code />
            </RichTextEditor.ControlsGroup>

          </RichTextEditor.Toolbar>
          <RichTextEditor.Content />
        </RichTextEditor>
        <Button type="submit" mt="sm">
          Create feedback item
        </Button>
      </form>
    </Container>
  );
}
