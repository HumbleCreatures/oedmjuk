import { useRouter } from "next/router";
import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import { Container, Text, Title } from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from "../../../../../components/SpaceNavBar";


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
  const { title, body, } = feedbackRound;

  return (
    <AppLayout>
      <Container size="xs">
        <SpaceNavBar space={space} isMember={isMember} />

        <>
          <Text fz="lg" fw={500}>
            <Title order={2}>Selection: {title}</Title>
          </Text>
          <Text>
            <div dangerouslySetInnerHTML={{ __html: body }} />
          </Text>
        </>
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
