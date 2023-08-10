import { Button, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { api } from "../utils/api";
import type { OutputData } from '@editorjs/editorjs';
import { useState } from "react";
import { ClearTriggerValues } from "./BlockEditor";
import BlockEditor from "./BlockEditor";

export function FeedbackNoteEditor({feedbackRoundId, feedbackItemId}: {feedbackRoundId: string, feedbackItemId:string}) {
  const [clearTrigger, setClearTrigger] = useState<ClearTriggerValues>();
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
    <div>
        <form
        onSubmit={form.onSubmit((values) => {
          mutation.mutate({ ...values, feedbackItemId });
          setClearTrigger(clearTrigger === ClearTriggerValues.clear ? ClearTriggerValues.clearAgain : ClearTriggerValues.clear);
        })}
      >
        
        <Text fz="sm" fw={500}>
                Body
              </Text>

              <BlockEditor clearTrigger={clearTrigger}  holder="blockeditor-container" onChange={(data:OutputData) => {
            form.setFieldValue('body', JSON.stringify(data))}}  />
        <Button type="submit" mt="sm">
          Create feedback item
        </Button>
      </form></div>
  );
}

export default FeedbackNoteEditor;