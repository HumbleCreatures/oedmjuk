import { useRouter } from "next/router";
import { type NextPage } from "next";
import AppLayout from "../../../../../../../components/AppLayout";
import { Container, Text, Title, createStyles, SimpleGrid, Button, Card, List, ThemeIcon, Group, Badge } from "@mantine/core";
import { api } from "../../../../../../../utils/api";
import { UserLinkWithData } from "../../../../../../../components/UserButton";
import { DateTime } from "luxon";
import { IconArrowMoveRight, IconNotes, IconPaperBag } from "@tabler/icons";
import { FeedbackRoundStates } from "../../../../../../../utils/enums";
import EditorJsRenderer from "../../../../../../../components/EditorJsRenderer";
import { useGeneralStyles } from "../../../../../../../styles/generalStyles";
import { SpaceLoader } from "../../../../../../../components/Loaders/SpaceLoader";
import dynamic from "next/dynamic";

const DynamicNoteEditor = dynamic(() => import('../../../../../../../components/FeedbackNoteEditor'), {
  ssr: false,
})

const useStyles = createStyles((theme) => ({
  areaTitle: {
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.xs, 
  },
  area: {
    backgroundColor: theme.colors.gray[4],
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  topArea: {
    backgroundColor: theme.colors.earth[9],
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  noteEditorArea: {
    backgroundColor: theme.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md, 
  },
  itemArea: {
    backgroundColor: theme.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  makeInline: { 
    display: 'inline-block',
  }
}));

function FeedbackItemView({ feedbackItemId }: { feedbackItemId: string }) {
  const { classes } = useStyles();
  const { classes: generalClasses } = useGeneralStyles();

  const router = useRouter();
  const feedbackResult = api.feedback.getFeedbackItem.useQuery({
    itemId: feedbackItemId,
  });

  if (feedbackResult.isLoading) return <SpaceLoader />;

  if (!feedbackResult.data) return <div>Could not load feedback round</div>;
  const feedbackItem = feedbackResult.data;
  const { title, body, createdAt, updatedAt, creatorId, createdByExternalUser, feedbackRound } = feedbackItem;

  return (
    <AppLayout>
      <Container size="sm" className={classes.topArea}>
        <Button onClick={() => router.back()}>Back to feedback round</Button>
      </Container>

      <Container size="sm" className={generalClasses.area}>
          <div className={generalClasses.metaArea}>
        <Group position="apart" className={generalClasses.topGroup}>
          <Group className={generalClasses.topGroup}>
        <ThemeIcon size="xl">
        <IconPaperBag />
          </ThemeIcon>
          <div>
          <Text fz="sm" fw={500} >Feedback item</Text>
        
          <Text fz="sm" fw={300} className={generalClasses.inlineText}>
            created{" "}
            <Text fz="sm" fw={500} className={generalClasses.inlineText}>
              {DateTime.fromJSDate(createdAt).setLocale("en").toRelative()}
            </Text>
          </Text>

          <Text fz="sm" className={generalClasses.inlineText}>
            {" "}by{" "}
            <Text fz="sm" fw={500} className={generalClasses.inlineText}>
              <UserLinkWithData userId={creatorId} />
            </Text>
          </Text>

          {updatedAt && updatedAt.getTime() !== createdAt.getTime() && (
            <Text fz="sm" fw={300}>
             last updated{" "}
              <Text fz="sm" fw={500} className={generalClasses.inlineText}>
                {DateTime.fromJSDate(updatedAt).setLocale("en").toRelative()}
              </Text>
            </Text>
          )}

          
        </div>
          </Group>
          
        </Group>
        </div>
        
        <div className={generalClasses.bodyArea}>
          <Group position="apart" className={generalClasses.topGroup}>
          <div>
          <Title order={2} className={generalClasses.mainTitle}>{title}</Title>
          
          </div>

          {createdByExternalUser && <Badge>External</Badge> }

        </Group>
        
        {body && <EditorJsRenderer data={body} />}
        </div>
        </Container>

      <Container size="sm"  className={generalClasses.clearArea}>
      
            <Group className={generalClasses.listHeader}>
        
                  <IconNotes />
        <Title order={2} className={classes.areaTitle}>Feedback notes</Title>
        </Group>

            <SimpleGrid cols={1} spacing="sm">
        {feedbackItem.feedbackNotes &&
          feedbackItem.feedbackNotes.map((note) => (
<Card key={note.id} shadow="sm" padding="lg" radius="md" withBorder mb="md">
<Card.Section p="sm">

{note.body && <EditorJsRenderer data={note.body} /> }

</Card.Section>

<Card.Section withBorder p="sm">
    <Text fz="sm" fw={300}>
               Created{" "}
              <Text fz="sm" fw={500} className={classes.makeInline}>
                {DateTime.fromJSDate(note.createdAt).setLocale("en").toRelative()}
              </Text>
              {" "}by{" "}
              <Text fz="sm" fw={500} className={classes.makeInline}>
                <UserLinkWithData userId={note.creatorId} />
              </Text>
              {note.updatedAt && note.updatedAt.getTime() !== note.createdAt.getTime() && (
                <>
                and last updated{" "}
                <Text fz="sm" fw={500} className={classes.makeInline}>
                  {DateTime.fromJSDate(note.updatedAt).setLocale("en").toRelative()}
                </Text></>
            )}
            </Text>
</Card.Section>
</Card>

          ))}
          </SimpleGrid>
      </Container>
      {feedbackRound.state === FeedbackRoundStates.Started && <Container size="sm" className={classes.noteEditorArea}>
      <Title order={2} className={classes.areaTitle}>
              Create feedback note
            </Title>
        <DynamicNoteEditor
          feedbackItemId={feedbackItemId}
          feedbackRoundId={feedbackItem.feedbackRoundId}
        />
      </Container> }

      {feedbackItem.feedbackMovement && feedbackItem.feedbackMovement.length > 0 &&<Container size="sm" className={classes.area}>
      <Title order={2} className={classes.areaTitle}>
              Moves
            </Title>
            <List
      spacing="xs"
      size="sm"
      center
      icon={
        <ThemeIcon color="earth" size={24} radius="xl">
          <IconArrowMoveRight size="1rem" />
        </ThemeIcon>
      }
    >
          {feedbackItem.feedbackMovement.map((move) => {
            if(move.feedbackColumn){
              return <List.Item key={move.id} >Moved to <Text fz="sm" fw={500} className={classes.makeInline}>{move.feedbackColumn.title}</Text> <Text fz="sm" fw={500} className={classes.makeInline}>{DateTime.fromJSDate(move.createdAt).setLocale("en").toRelative()}</Text> by <Text fz="sm" fw={500} className={classes.makeInline}><UserLinkWithData userId={move.moverId} /></Text></List.Item>
            }
            if(move.feedbackColumn && createdByExternalUser) {
              return <List.Item key={move.id} >Moved back to external feedback by <UserLinkWithData userId={move.moverId} /></List.Item>
            }
            return <List.Item key={move.id} >Moved back to users feedback by <UserLinkWithData userId={move.moverId} /></List.Item>
          }
            
          )}
          </List>
      </Container> }
    </AppLayout>
  );
}
const FeedbackItemPage: NextPage = () => {
  const router = useRouter();

  const { feedbackItemId } = router.query;
  if (!feedbackItemId) return <div>loading...</div>;

  return <FeedbackItemView feedbackItemId={feedbackItemId as string} />;
};

export default FeedbackItemPage;
