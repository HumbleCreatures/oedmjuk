import { Alert, Button, createStyles, Title } from "@mantine/core";
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

export function ObjectionEditor({ proposalId }: { proposalId: string }) {
  const { classes } = useStyles();
  const clearForm = useRef<VoidFunc>();

  const form = useForm({
    initialValues: {
      body: "",
    },
    validate: {
      body: (value) =>
        value.length < 10 ? "Name must have at least 10 letters" : null,
    },
  });

  const utils = api.useContext();
  const mutation = api.proposal.addObjection.useMutation({
    onSuccess() {
      void utils.proposal.getProposal.invalidate({ proposalId });
    },
  });

  return (
    <div>
      <form
        onSubmit={form.onSubmit((values) => {
          mutation.mutate({ ...values, proposalId });
          clearForm.current?.();
        })}
      >
        <Title order={2} className={classes.areaTitle}>
          Create objection
        </Title>
        <ARichTextEditor
          onUpdate={(html) => form.setFieldValue("body", html)}
          clearForm={clearForm}
        />

        <Button type="submit" mt="sm">
          Create objection
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
