import { RichTextEditor } from "@mantine/tiptap";
import { Button, Container, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { api } from "../utils/api";

export function FeedbackNoteEditor({feedbackRoundId, feedbackItemId}: {feedbackRoundId: string, feedbackItemId:string}) {
  const form = useForm({
    initialValues: {
      body: "",
    },
    validate: {
      body: (value) =>
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
  const mutation = api.feedback.addFeedbackNote.useMutation({
    onSuccess() {
      void utils.feedback.getFeedbackRound.invalidate({ itemId: feedbackRoundId});
      void utils.feedback.getFeedbackItem.invalidate({ itemId: feedbackItemId});
    },
  });

  return (
    <Container>
        <div>Create feedback item</div>
        <form
        onSubmit={form.onSubmit((values) => {
          mutation.mutate({ ...values, feedbackItemId })
        })}
      >
        
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

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.H1 />
              <RichTextEditor.H2 />
              <RichTextEditor.H3 />
              <RichTextEditor.H4 />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Blockquote />
              <RichTextEditor.Hr />
              <RichTextEditor.BulletList />
              <RichTextEditor.OrderedList />
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
