import { useRouter } from "next/router";
import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import { Container, Text, Title } from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from "../../../../../components/SpaceNavBar";
import { FeedbackItemEditor } from "../../../../../components/FeedbackItemEditor";
import { ExternalFeedbackItemCardList } from "../../../../../containers/ExternalFeedbackItemCardList";
import { MyFeedbackItemCardList } from "../../../../../containers/MyFeedbackItemCardList";
import { FeedbackColumns } from "../../../../../components/FeedbackColumns";


function FeedbackView({
  spaceId,
 feedbackRoundId,
}: {
  spaceId: string;
  feedbackRoundId: string;
}) {
  const spaceResult = api.space.getSpace.useQuery({ spaceId });
  const feedbackResult = api.feedback.getFeedbackRound.useQuery({ itemId: feedbackRoundId });

  if (feedbackResult.isLoading || spaceResult.isLoading)
    return <div>loading...</div>;

  if (!spaceResult.data) return <div>Could not load space</div>;
  const { space, isMember } = spaceResult.data;

  if (!feedbackResult.data) return <div>Could not load feedback round</div>;
  const feedbackRound = feedbackResult.data;
  const { title, body } = feedbackRound;

  return (
    <AppLayout>
      <Container size="xs">
        <SpaceNavBar space={space} isMember={isMember} />

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
      <FeedbackColumns feedbackColumns={feedbackRound.feedbackColumns} feedbackRound={feedbackRound}  />

      <Container size="xs">
          <Text >
            <Title>My items</Title>
            <MyFeedbackItemCardList feedbackRoundId={feedbackRoundId} feedbackColumns={feedbackRound.feedbackColumns} feedbackRound={feedbackRound} />
          </Text>
        
        <FeedbackItemEditor feedbackRoundId={feedbackRoundId} />
      </Container>
      <Container size="xs">
        <Text >
            <Title>External feedback items</Title>
          </Text>
        <ExternalFeedbackItemCardList feedbackRoundId={feedbackRoundId} feedbackColumns={feedbackRound.feedbackColumns} feedbackRound={feedbackRound}/>
        
      </Container>

    </AppLayout>
  );
}
const FeedbackPage: NextPage = () => {
  const router = useRouter();

  const { spaceId, itemId } = router.query;
  if (!spaceId || !itemId) return <div>loading...</div>;

  return (
    <FeedbackView spaceId={spaceId as string} feedbackRoundId={itemId as string} />
  );
};

export default FeedbackPage;
