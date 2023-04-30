import { useRouter } from "next/router";
import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import { Container, Text, Title } from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from "../../../../../components/SpaceNavBar";
import { ObjectionEditor } from "../../../../../components/ObjectionEditor";
import { ListOfObjections } from "../../../../../components/ObjectionList";
import { Button, Radio, Group } from "@mantine/core";
import { ProposalStates } from "../../../../../utils/enums";
import { VoteValue } from "../../../../../utils/enums";

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

  const buyVotes = api.selection.buyVotes.useMutation({
    onSuccess: () => {
      void selectionResult.refetch();
      void voteResult.refetch();
    },
  });

  if (selectionResult.isLoading || spaceResult.isLoading)
    return <div>loading...</div>;

  if (!spaceResult.data) return <div>Could not load space</div>;
  const { space, isMember } = spaceResult.data;

  if (!selectionResult.data) return <div>Could not load proposal</div>;
  const selection = selectionResult.data;
  if (!selection) return <div>Could not load proposal</div>;
  const { alternatives, status, title, body, participants } = selection;


  return (
    <AppLayout>
      <Container size="xs">
        <SpaceNavBar space={space} isMember={isMember} />

        <>
          <Text fz="lg" fw={500}>
            <Title order={2}>Proposal: {title}</Title>
          </Text>
          <Text>
            <div dangerouslySetInnerHTML={{ __html: body }} />
          </Text>
        </>
      </Container>
      <Container size="xs">
        {proposalState === ProposalStates.ProposalCreated && (
          <ObjectionEditor proposalId={proposalId} />
        )}
        <ListOfObjections objections={objections || []} />
        {objections.filter((o) => !o.resolvedAt).length === 0 ? (
          <Button onClick={() => closeAddAlternativesRound.mutate({ proposalId })}>
            Start voting round
          </Button>
        ) : (
          <Button disabled={true}>Start voting round</Button>
        )}
      </Container>

      {proposalState === ProposalStates.ObjectionsResolved && (
        <Container size="xs">
          <Text fz="lg" fw={500}>
            The voting round is now open.
            {voteResult.data && (
              <div>
                You have already voted.
                <Button
                  onClick={() =>
                    setVoteState({ ...voteState, voteAgain: true })
                  }
                >
                  Make new vote
                </Button>
              </div>
            )}
            {(!voteResult.data || voteState.voteAgain) && (
              <>
                <Radio.Group
                  name="acceptOrDeny"
                  label="Vote to accept or deny the proposal"
                  description="Make your voice heard"
                  onChange={(value) =>
                    setVoteState({
                      ...voteState,
                      voteValue: value as VoteValue,
                    })
                  }
                >
                  <Group mt="xs">
                    <Radio value="Accept" label="Accept" />
                    <Radio
                      value="Reject"
                      label="Reject"
                      onChange={() =>
                        setVoteState({
                          ...voteState,
                          voteValue: VoteValue.Reject,
                        })
                      }
                    />
                    <Radio
                      value="Abstain"
                      label="Abstain"
                      onChange={() =>
                        setVoteState({
                          ...voteState,
                          voteValue: VoteValue.Abstain,
                        })
                      }
                    />
                  </Group>
                </Radio.Group>

                <Radio.Group
                  name=""
                  label="Make your pick"
                  description="Who do you think is an expert on this topic? Who do you trust?"
                  onChange={(value) =>
                    setVoteState({
                      ...voteState,
                      myPickId: value,
                      myPickChosen: true,
                    })
                  }
                >
                  <Group mt="xs">
                    {participants.map((p) => (
                      <UserRadioButton
                        key={p.participantId}
                        userId={p.participantId}
                      />
                    ))}
                    <Radio value="none" label="No one" />
                  </Group>
                </Radio.Group>
                <Button
                  disabled={!voteState.voteValue || !voteState.myPickChosen}
                  onClick={() => {
                    castVote.mutate({
                      proposalId,
                      voteValue:
                        voteState.voteValue === undefined
                          ? VoteValue.Abstain
                          : voteState.voteValue,
                      myPickId: voteState.myPickId,
                    });
                    setVoteState({ ...voteState, voteAgain: false });
                  }}
                >
                  Vote
                </Button>
              </>
            )}
            <Button onClick={() => endVoting.mutate({ proposalId })}>
              End vote and show results
            </Button>
          </Text>
        </Container>
      )}
    </AppLayout>
  );
}
const ProposalPage: NextPage = () => {
  const router = useRouter();

  const { spaceId, itemId } = router.query;
  if (!spaceId || !itemId) return <div>loading...</div>;

  return (
    <SelectionView spaceId={spaceId as string} proposalId={itemId as string} />
  );
};

function UserRadioButton({ userId }: { userId: string }) {
  const user = api.user.getUser.useQuery({ userId }).data;
  if (!user) return <div>loading...</div>;
  return <Radio key={userId} value={userId} label={user.name} />;
}

export default ProposalPage;
