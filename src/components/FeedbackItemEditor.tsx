import { Button, Container, TextInput, createStyles, Title, Card } from "@mantine/core";
import { useForm } from "@mantine/form";
import { api } from "../utils/api";
import type { OutputData } from '@editorjs/editorjs';
import { useState } from "react";
import { ClearTriggerValues } from "./BlockEditor";
import { BlockEditor } from "./BlockEditor";

const useStyles = createStyles((theme) => ({

  areaTitle: {
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.xs,
  },
  cardWrapper: {
    width: 300,
  }
 
}));

export function FeedbackItemEditor({feedbackRoundId}: {feedbackRoundId: string}) {
  const { classes } = useStyles();
  const [clearTrigger, setClearTrigger] = useState<ClearTriggerValues>();
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

  const utils = api.useContext();
  const mutation = api.feedback.createFeedbackItem.useMutation({
    onSuccess() {
      void utils.feedback.getFeedbackRound.invalidate({ itemId: feedbackRoundId});
      void utils.feedback.getMyFeedbackItems.invalidate({ itemId: feedbackRoundId});
      void utils.feedback.getExternalFeedbackItems.invalidate({ itemId: feedbackRoundId});
    },
  });

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder mb="md" className={classes.cardWrapper}>
      <Card.Section p="sm">
        <Title order={3} className={classes.areaTitle}>
              Create feedback item
            </Title>
        <form
        onSubmit={form.onSubmit((values) => {
          mutation.mutate({ ...values, feedbackRoundId });
          form.reset();
          setClearTrigger(clearTrigger === ClearTriggerValues.clear ? ClearTriggerValues.clearAgain : ClearTriggerValues.clear);
        })}
      >
        <TextInput
          label="Title"
          placeholder="Title"
          {...form.getInputProps("title")}
        />
        <div>Body</div>
        <BlockEditor holder="blockeditor-container" clearTrigger={clearTrigger} onChange={(data:OutputData) => {
              form.setFieldValue('body', JSON.stringify(data))}} />
        <Button type="submit" mt="sm">
          Create feedback item
        </Button>
      </form>
      </Card.Section>
    </Card>
  );
}

export default FeedbackItemEditor;