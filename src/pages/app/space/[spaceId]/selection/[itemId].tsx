import { useRouter } from "next/router";
import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import { Button, Container, Text, Title } from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from "../../../../../components/SpaceNavBar";
import { AlternativeEditor } from "../../../../../components/AlternativeEditor";
import { AlternativeListItem } from "../../../../../components/AlternativeListItem";
import { SelectionStates } from "../../../../../utils/enums";

function SelectionView({
  spaceId,
  selectionId,
}: {
  spaceId: string;
  selectionId: string;
}) {
  const spaceResult = api.space.getSpace.useQuery({ spaceId });
  const selectionResult = api.selection.getSelection.useQuery({ selectionId });
  const voteResult = api.selection.getUserVotes.useQuery({ selectionId });

  const startBuyingRound = api.selection.startBuyingRound.useMutation({
    onSuccess: () => {
      void selectionResult.refetch();
    },
  });

  const endVoting = api.selection.endVoting.useMutation({
    onSuccess: () => {
      void selectionResult.refetch();
    },
  });


  if (selectionResult.isLoading || spaceResult.isLoading)
    return <div>loading...</div>;

  if (!spaceResult.data) return <div>Could not load space</div>;
  const { space, isMember } = spaceResult.data;

  if (!selectionResult.data) return <div>Could not load selection</div>;
  const selection = selectionResult.data;
  if (!selection) return <div>Could not load selection</div>;
  const { alternatives, status, title, body, participants } = selection;

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
      <Container size="xs">
        {selection.status === SelectionStates.Created && (
          <AlternativeEditor selectionId={selectionId} />
        )}

      {selection.status === SelectionStates.BuyingStarted && voteResult.data && voteResult.data.data ? (
          <Text>Number of point left to spend: {voteResult.data.data.leftToSpend ? voteResult.data.data.leftToSpend : 0  }</Text>
        ) : <Text>You can not buy votes. {selection.status}</Text>}

        {voteResult.data && voteResult.data.data ? selection.alternatives.map((alternative) => (
          <AlternativeListItem 
          key={alternative.id}
          showResults={selection.status === SelectionStates.VoteClosed} 
          alternative={alternative} canVote={!!voteResult.data?.canBuyVotes} 
          currentVotingBalance={voteResult.data.data?.leftToSpend}
          vote={voteResult.data.data?.votes.find(v => v.alternativeId === alternative.id)}
          />
        )) : selection.alternatives.map((alternative) => (
          <AlternativeListItem
          showResults={selection.status === SelectionStates.VoteClosed}  
          key={alternative.id} 
          alternative={alternative} canVote={!!voteResult.data?.canBuyVotes}   />
        ))}
      </Container>

      <Container size="xs">
        {selection.status === SelectionStates.Created && (
          <Button
            disabled={selection.alternatives.length < 3}
            onClick={() => startBuyingRound.mutate({ selectionId })}
          >
            Start buying votes
          </Button>
        )}
      </Container>

      <Container size="xs">
        {selection.status === SelectionStates.BuyingStarted && (
          <Button
            disabled={selection.alternatives.length < 3}
            onClick={() => endVoting.mutate({ selectionId })}
          >
            Finish buying votes
          </Button>
        )}
      </Container>
    </AppLayout>
  );
}
const SelectionPage: NextPage = () => {
  const router = useRouter();

  const { spaceId, itemId } = router.query;
  if (!spaceId || !itemId) return <div>loading...</div>;

  return (
    <SelectionView spaceId={spaceId as string} selectionId={itemId as string} />
  );
};

export default SelectionPage;
