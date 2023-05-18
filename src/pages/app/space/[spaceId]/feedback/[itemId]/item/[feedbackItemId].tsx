import { useRouter } from "next/router";
import { type NextPage } from "next";
import AppLayout from "../../../../../../../components/AppLayout";
import { Container, Text, Title, createStyles, SimpleGrid, Button, Card, List, ThemeIcon } from "@mantine/core";
import { api } from "../../../../../../../utils/api";
import { FeedbackNoteEditor } from "../../../../../../../components/FeedbackNoteEditor";
import { UserLinkWithData } from "../../../../../../../components/UserButton";
import { DateTime } from "luxon";
import { IconArrowMoveRight } from "@tabler/icons";

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
  const router = useRouter();
  const feedbackResult = api.feedback.getFeedbackItem.useQuery({
    itemId: feedbackItemId,
  });

  if (feedbackResult.isLoading) return <div>loading...</div>;

  if (!feedbackResult.data) return <div>Could not load feedback round</div>;
  const feedbackItem = feedbackResult.data;
  const { title, body, createdAt, updatedAt, authorId, createdByExternalUser } = feedbackItem;

  return (
    <AppLayout>
      <Container size="sm" className={classes.topArea}>
        <Button onClick={() => router.back()}>Back to feedback round</Button>
      </Container>
      <Container size="sm" className={classes.itemArea}>
          <SimpleGrid cols={1}>
            <Title order={2} fw={500} fz="xl"> {title}</Title>
            <Text fz="sm" fw={300}>
               Created{" "}
              <Text fz="sm" fw={500} className={classes.makeInline}>
                {DateTime.fromJSDate(createdAt).setLocale("en").toRelative()}
              </Text>
              {" "}by{" "}
              <Text fz="sm" fw={500} className={classes.makeInline}>
                <UserLinkWithData userId={authorId} />
              </Text>
              {updatedAt && updatedAt.getTime() !== createdAt.getTime() && (
                <>
                and last updated{" "}
                <Text fz="sm" fw={500} className={classes.makeInline}>
                  {DateTime.fromJSDate(updatedAt).setLocale("en").toRelative()}
                </Text></>
            )}
            </Text>

            
            <div dangerouslySetInnerHTML={{ __html: body }} />
          </SimpleGrid>
        
      </Container>


      <Container size="sm"  className={classes.area}>
         <Title order={2} className={classes.areaTitle}>
              Feedback notes
            </Title>
            <SimpleGrid cols={1}>
        {feedbackItem.feedbackNotes &&
          feedbackItem.feedbackNotes.map((note) => (
<Card key={note.id} shadow="sm" padding="lg" radius="md" withBorder mb="md">
<Card.Section p="sm">

  <div dangerouslySetInnerHTML={{ __html: note.body }} />

</Card.Section>

<Card.Section withBorder p="sm">
    <Text fz="sm" fw={300}>
               Created{" "}
              <Text fz="sm" fw={500} className={classes.makeInline}>
                {DateTime.fromJSDate(note.createdAt).setLocale("en").toRelative()}
              </Text>
              {" "}by{" "}
              <Text fz="sm" fw={500} className={classes.makeInline}>
                <UserLinkWithData userId={note.authorId} />
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
      <Container size="sm" className={classes.noteEditorArea}>
      <Title order={2} className={classes.areaTitle}>
              Create feedback note
            </Title>
        <FeedbackNoteEditor
          feedbackItemId={feedbackItemId}
          feedbackRoundId={feedbackItem.feedbackRoundId}
        />
      </Container>

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
