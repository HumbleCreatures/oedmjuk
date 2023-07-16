import { Button, Container, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { api } from "../utils/api";
import type { OutputData } from '@editorjs/editorjs';
import { DynamicBlockEditor } from "./DynamicBlockEditor";

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


  const utils = api.useContext();
  const mutation = api.feedback.addFeedbackNote.useMutation({
    onSuccess() {
      void utils.feedback.getFeedbackRound.invalidate({ itemId: feedbackRoundId});
      void utils.feedback.getFeedbackItem.invalidate({ itemId: feedbackItemId});
    },
  });

  return (
    <Container>
        <form
        onSubmit={form.onSubmit((values) => {
          mutation.mutate({ ...values, feedbackItemId })
        })}
      >
        
        <Text fz="sm" fw={500}>
                Body
              </Text>
              <DynamicBlockEditor holder="blockeditor-container" onChange={(data:OutputData) => {
              form.setFieldValue('body', JSON.stringify(data))}}  />
        <Button type="submit" mt="sm">
          Create feedback item
        </Button>
      </form>
    </Container>
  );
}
