import {
  Button,
  Alert,
  Card,
  Group,
  Text,
  Badge,
  SimpleGrid,
  createStyles,
  Title,
} from "@mantine/core";
import { Objection } from "@prisma/client";
import { ARichTextEditor } from "./RichTextEditor";
import { UserButtonWithData, UserLinkWithData } from "./UserButton";
import { useState } from "react";
import { useForm } from "@mantine/form";
import { api } from "../utils/api";
import { IconAlertCircle } from "@tabler/icons";
import { DateTime } from "luxon";

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

export function ListOfObjections({ objections }: { objections: Objection[] }) {
  return (
    <SimpleGrid cols={1}>
      {objections.map((objection) => (
        <Objection key={objection.id} objection={objection} />
      ))}
    </SimpleGrid>
  );
}

export function Objection({ objection }: { objection: Objection }) {
  const { classes } = useStyles();
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
    <Card key={objection.id} withBorder shadow="sm" radius="md">
      <Card.Section withBorder inheritPadding py="xs">
        <Group position="apart">
          <Text fz="sm" fw={300}>
            Created{" "}
            <Text fz="sm" fw={500} className={classes.inlineText}>
              {DateTime.fromJSDate(objection.createdAt)
                .setLocale("en")
                .toRelative()}
            </Text>{" "}
            by{" "}
            <Text fz="sm" fw={500} className={classes.inlineText}>
              <UserLinkWithData userId={objection.authorId} />
            </Text>
          </Text>

          <Text fz="md" fw={500}>
            {objection.resolvedAt ? (
              <Badge>Resolved</Badge>
            ) : (
              <Badge>Open</Badge>
            )}
          </Text>
        </Group>
      </Card.Section>

      <Card.Section mt="md" inheritPadding py="xs">
        <div dangerouslySetInnerHTML={{ __html: objection.body }} />
      </Card.Section>

      {objection.resolvedAt ? (
        <Card.Section withBorder mt="md" inheritPadding py="xs">
          <SimpleGrid cols={1}>
            <Text fz="sm" fw={300}>
              Resolved{" "}
              <Text fz="sm" fw={500} className={classes.inlineText}>
                {DateTime.fromJSDate(objection.resolvedAt)
                  .setLocale("en")
                  .toRelative()}
              </Text>{" "}
              by{" "}
              <Text fz="sm" fw={500} className={classes.inlineText}>
                <UserLinkWithData userId={objection.resolvedById} />
              </Text>
            </Text>

            <div
              dangerouslySetInnerHTML={{
                __html: objection.resolvedComment as string,
              }}
            />
          </SimpleGrid>
        </Card.Section>
      ) : (
        <Card.Section withBorder mt="md" inheritPadding py="xs">

            {!objection.resolvedAt && !showResolveEditor && (
              <Button onClick={() => setShowResolveEditor(true)} mt="sm">
                Resolve objection
              </Button>
            )}

            {showResolveEditor && !objection.resolvedAt && (
              <form
                onSubmit={form.onSubmit((values) => {
                  mutation.mutate({ ...values, objectionId: objection.id });
                })}
              >
                <Title order={4} className={classes.areaTitle}>
                  Resolve objection
                </Title>

                <ARichTextEditor
                  onUpdate={(html) => form.setFieldValue("comment", html)}
                />
                <Group position="apart">
                  <Button type="submit" mt="sm">
                    Close objection
                  </Button>

                  <Button onClick={() => setShowResolveEditor(false)} mt="sm" color="red">
                    Cancel
                  </Button>
                </Group>

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

        </Card.Section>
      )}
    </Card>
  );
}

/*

    <li key={objection.id}>
      <div>{objection.resolvedAt ? "Resolved" : "Open"}</div>
      {objection.body}
      <UserButtonWithData userId={objection.authorId}></UserButtonWithData>

      <div>
        
      </div>

      
    </li>
    */
