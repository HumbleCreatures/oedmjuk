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
  Textarea,
  Container,
  Tabs
} from "@mantine/core";
import { ProposalObjection } from "@prisma/client";

import { UserLinkWithData } from "./UserButton";
import { useState } from "react";
import { useForm } from "@mantine/form";
import { api } from "../utils/api";
import { IconAlertCircle } from "@tabler/icons";
import { DateTime } from "luxon";
import EditorJsRenderer from "./EditorJsRenderer";
import { useGeneralStyles } from "../styles/generalStyles";

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
  tabNav: {
    marginBottom: theme.spacing.md,
  }
}));

export function ListOfObjections({ objections, defaultTab }: { objections: ProposalObjection[], defaultTab: 'open' | 'resolved' }) {
  const { classes: generalClasses } = useGeneralStyles();

  const openObjections = objections.filter((objection) => !objection.resolvedAt);
  const resolvedObjections = objections.filter((objection) => !!objection.resolvedAt);

  return (
    <Container size="sm" className={generalClasses.clearArea}>
          <Title order={3} className={generalClasses.sectionTitle}>
            Objections
          </Title>
          <Tabs defaultValue={defaultTab} 
          styles={(theme) => ({
            tabsList: {
              border: 'none',
            },
            tab: { 
              color: theme.white,
              marginBottom: theme.spacing.xs,
              borderColor: theme.colors.earth[2],
              borderRadius: 0,
              '&[right-section]': {
                backgroundColor: theme.fn.rgba(theme.white, 0.1),
               },
              '&:hover': {
                backgroundColor: theme.fn.rgba(theme.white, 0.05),
                borderColor: theme.colors.earth[2],
              },
              '&[data-active]': {
                backgroundColor: theme.fn.rgba(theme.white, 0.1),
                borderColor: theme.white,
                color: theme.white,
              },
              '&[data-active]:hover': {
                backgroundColor: theme.fn.rgba(theme.white, 0.1),
                borderColor: theme.white,
                color: theme.white,
              },
            }
          })}>
      <Tabs.List grow>
        <Tabs.Tab
          rightSection={
            <Badge
              w={16}
              h={16}
              sx={{ pointerEvents: 'none' }}
              size="xs"
              p={0}
              
            >
              {openObjections.length}
            </Badge>
          }
          value="open"
        >
          Open
        </Tabs.Tab>
        <Tabs.Tab value="resolved"
        rightSection={
          <Badge
            w={16}
            h={16}
            sx={{ pointerEvents: 'none' }}
            size="xs"
            p={0}
            
          >
            {resolvedObjections.length}
          </Badge>
        }>Resolved</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="open">
      <SimpleGrid cols={1}>
      {openObjections.map((objection) => (
        <Objection key={objection.id} objection={objection} />
      ))}
    </SimpleGrid>
      </Tabs.Panel>
      <Tabs.Panel value="resolved">
      <SimpleGrid cols={1}>
      {resolvedObjections.map((objection) => (
        <Objection key={objection.id} objection={objection} />
      ))}
    </SimpleGrid>
      </Tabs.Panel>
    </Tabs>

    
    </Container>
  );
}

export function Objection({ objection }: { objection: ProposalObjection }) {
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
        itemId: objection.proposalId,
      });
    },
  });

  return (
    <Card key={objection.id} withBorder shadow="sm" radius="md">
      <Card.Section withBorder inheritPadding py="xs">
        <Group position="apart">
          <Text fz="sm" fw={300}>
            Objection created{" "}
            <Text fz="sm" fw={500} className={classes.inlineText}>
              {DateTime.fromJSDate(objection.createdAt)
                .setLocale("en")
                .toRelative()}
            </Text>{" "}
            by{" "}
            <Text fz="sm" fw={500} className={classes.inlineText}>
              <UserLinkWithData userId={objection.creatorId} />
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
      {objection.body && <EditorJsRenderer data={objection.body} />}
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
              {objection.resolvedById &&<Text fz="sm" fw={500} className={classes.inlineText}>
                 <UserLinkWithData userId={objection.resolvedById} /> 
              </Text>}
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
                <Textarea
                  placeholder="Why do you think this objection should be resolved?"
                  label="Why do you think this objection should be resolved?"
                  autosize
                  minRows={2}
                  {...form.getInputProps("comment")}
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
