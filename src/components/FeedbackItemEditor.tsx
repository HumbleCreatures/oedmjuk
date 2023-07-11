import { Button, Container, TextInput, createStyles, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { api } from "../utils/api";
import { DynamicBlockEditor } from "./DynamicBlockEditor";
import type { OutputData } from '@editorjs/editorjs';

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
        <DynamicBlockEditor holder="blockeditor-container" onChange={(data:OutputData) => {
              form.setFieldValue('body', JSON.stringify(data))}} />
        <Button type="submit" mt="sm">
          Create feedback item
        </Button>
      </form>
    </Container>
  );
}
