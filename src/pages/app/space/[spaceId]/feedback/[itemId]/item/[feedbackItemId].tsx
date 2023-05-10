import { useRouter } from "next/router";
import { type NextPage } from "next";
import AppLayout from "../../../../../../../components/AppLayout";
import { Container, Text, Title } from "@mantine/core";
import { api } from "../../../../../../../utils/api";
import Link from "next/link";
import { FeedbackNoteEditor } from "../../../../../../../components/FeedbackNoteEditor";
import { UserButtonWithData } from "../../../../../../../components/UserButton";

function FeedbackItemView({
  feedbackItemId,
}: {
  feedbackItemId: string;
}) {

  const feedbackResult = api.feedback.getFeedbackItem.useQuery({
    itemId: feedbackItemId,
  });

  if (feedbackResult.isLoading)
    return <div>loading...</div>;

  if (!feedbackResult.data) return <div>Could not load feedback round</div>;
  const feedbackItem = feedbackResult.data;
  const { title, body, feedbackRound } = feedbackItem;

  return (
    <AppLayout>
      <Container size="xs">
      <Container size="xs">
      <Link href={`/app/space/${feedbackRound.spaceId}/feedback/${feedbackRound.id}`} key={feedbackRound.id}> 
      Back to feedback round
      </Link>
      </Container>
        <>
          <Text fz="lg" fw={500}>
            <Title order={2}>Feedback: {title}</Title>
          </Text>
          <Text>
            <div dangerouslySetInnerHTML={{ __html: body }} />
          </Text>
        </>
      </Container>
      <Container size="xs">
        <Title order={4}>My feedback items</Title>
      </Container>
      <Container size="xs">
        <Text>Feedback notes</Text>
        {feedbackItem.feedbackNotes && feedbackItem.feedbackNotes.map((note) => (<div key={note.id}>
          {note.body}
          <UserButtonWithData userId={note.authorId} />
        </div>))}
      </Container>
      <Container size="xs">
        <FeedbackNoteEditor feedbackItemId={feedbackItemId} feedbackRoundId={feedbackItem.feedbackRoundId} />
      </Container>
      <Container size="xs">
        <Text>Moves</Text>
        {feedbackItem.feedbackMovement && feedbackItem.feedbackMovement.map((move) => (<div key={move.id}>
          moves to {move.feedbackColumn && move.feedbackColumn.title}
          <UserButtonWithData userId={move.moverId} />
        </div>))}
      </Container>
    </AppLayout>
  );
}
const FeedbackItemPage: NextPage = () => {
  const router = useRouter();

  const { feedbackItemId } = router.query;
  if (!feedbackItemId) return <div>loading...</div>;

  return (
    <FeedbackItemView
      feedbackItemId={feedbackItemId as string}
    />
  );
};

export default FeedbackItemPage;
