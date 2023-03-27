import { Button, Alert } from "@mantine/core";
import { Objection } from "@prisma/client";
import { ARichTextEditor } from "./RichTextEditor";
import { UserButtonWithData } from "./UserButton";
import { useState } from "react";
import { useForm } from "@mantine/form";
import { api } from "../utils/api";
import { IconAlertCircle } from "@tabler/icons";

export function ListOfObjections({ objections }: { objections: Objection[] }) {
  return (
    <ul>
      {objections.map((objection) => (
        <Objection key={objection.id} objection={objection} />
      ))}
    </ul>
  );
}

export function Objection({ objection }: { objection: Objection }) {
  const [showResolveEditor, setShowResolveEditor] = useState(false);
  const form = useForm({
    initialValues: {
      comment: "",
    },
    validate: {
      comment: (value) =>
        value.length < 5 ? "Name must have at least 5 letters" : null,
    },
  });

  const utils = api.useContext();
  const mutation = api.proposal.resolveObjection.useMutation({
    onSuccess() {
      void utils.proposal.getProposal.invalidate({
        proposalId: objection.proposalId,
      });
    },
  });

  return (
    <li key={objection.id}>
      <div>{objection.resolvedAt ? "Resolved" : "Open"}</div>
      {objection.body}
      <UserButtonWithData userId={objection.authorId}></UserButtonWithData>

      <div>
        {!objection.resolvedAt && (
          <Button onClick={() => setShowResolveEditor(true)} mt="sm">
            Resolve objection
          </Button>
        )}
      </div>

      {showResolveEditor && !objection.resolvedAt && (
        <form
          onSubmit={form.onSubmit((values) => {
            mutation.mutate({ ...values, objectionId: objection.id });
          })}
        >
          <h3>Resolve objection</h3>

          <ARichTextEditor
            onUpdate={(html) => form.setFieldValue("comment", html)}
          />

          <Button type="submit" mt="sm">
            Close objection
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
      )}
    </li>
  );
}
