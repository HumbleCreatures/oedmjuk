import { Alert, Button, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons";
import { api } from "../utils/api";
import { ARichTextEditor, VoidFunc } from "./RichTextEditor";
import { useRef } from "react";

export function ObjectionEditor({ proposalId }: { proposalId: string }) {
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
        <h1>Create objection</h1>
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
