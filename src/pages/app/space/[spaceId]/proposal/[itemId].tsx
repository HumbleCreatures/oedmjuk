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
import { useState } from "react";
import { VoteValue } from "../../../../../utils/enums";

function ProposalView({
  spaceId,
  proposalId,
}: {
  spaceId: string;
  proposalId: string;
}) {
  const spaceReslt = api.space.getSpace.useQuery({ spaceId });
  const proposalResult = api.proposal.getProposal.useQuery({ proposalId });
  const voteResult = api.proposal.getUserVote.useQuery({ proposalId });
  const closeObjectionRound = api.proposal.closeObjectionRound.useMutation({
    onSuccess: () => {
      void proposalResult.refetch();
    }
  });

  const castVote = api.proposal.castVote.useMutation({
    onSuccess: () => {
      void proposalResult.refetch();
      void voteResult.refetch();
    }
  });

  const [voteState, setVoteState] = useState<{ voteValue?:VoteValue, myPickId?: string, myPickChosen: boolean }>({myPickChosen: false});
  
  if(proposalResult.isLoading || spaceReslt.isLoading ) return <div>loading...</div>;

  if (!spaceReslt.data) return <div>Could not load space</div>;
  const { space, isMember } = spaceReslt.data;

  if (!proposalResult.data) return <div>Could not load proposal</div>;
  const { objections, proposalState, title, body, participants } = proposalResult.data;



  return (
    <AppLayout>
      <Container size="xs">
        <SpaceNavBar space={space} isMember={isMember} />

       
       
          <>
            <Text fz="lg" fw={500}>
              <Title order={2}>Proposal: {title}</Title>
            </Text>
            <Text>
              <div
                dangerouslySetInnerHTML={{ __html: body }}
              />
            </Text>
          </>
        
      </Container>
      <Container size="xs">
        {proposalState === ProposalStates.ProposalCreated && <ObjectionEditor proposalId={proposalId} /> }
        <ListOfObjections objections={objections || []} /> 
        {objections.filter(o => !o.resolvedAt).length === 0 ? 
          <Button onClick={() => closeObjectionRound.mutate({proposalId})}>Start voting round</Button> : 
          <Button disabled={true}>Start voting round</Button>}        
      </Container>
      
      {proposalState === ProposalStates.ObjectionsResolved && <Container size="xs">
        <Text fz="lg" fw={500}> 
        The voting round is now open.

        {voteResult.data && <div>
          You have already voted. You voted {voteResult.data.accept === undefined ? "Abstain" : voteResult.data.accept ? "Accept" : "Rejected"} and picked {voteResult.data.myPickId}
          </div>}
        <Radio.Group
      name="acceptOrDeny"
      label="Vote to accept or deny the proposal"
      description="Make your voice heard"
      onChange={(value) => setVoteState({...voteState, voteValue: value as VoteValue})}
    >
      <Group mt="xs">
        <Radio value="Accept" label="Accept"  />
        <Radio value="Reject" label="Reject" onChange={() => setVoteState({...voteState, voteValue: VoteValue.Reject})}/>
        <Radio value="Abstain" label="Abstain" onChange={() => setVoteState({...voteState, voteValue: VoteValue.Abstain})} />
      </Group>
    </Radio.Group>

    <Radio.Group
      name=""
      label="Make your pick"
      description="Who do you think is an expert on this topic? Who do you trust?"
      onChange={(value) => setVoteState({...voteState, myPickId: value, myPickChosen: true})} 
    >
      <Group mt="xs">
        {participants.map(p => <UserRadioButton key={p.participantId} userId={p.participantId}  />)}
        <Radio value="none" label="No one" />
      </Group>
    </Radio.Group>
    <Button disabled={!voteState.voteValue || !voteState.myPickChosen}
    onClick={() => castVote.mutate({proposalId, voteValue: voteState.voteValue === undefined ? VoteValue.Abstain : voteState.voteValue, myPickId: voteState.myPickId}) }
    >Vote</Button>
        </Text>      
      </Container> }

    </AppLayout>
  );
}
const ProposalPage: NextPage = () => {
  const router = useRouter();

  const { spaceId, itemId } = router.query;
  if (!spaceId || !itemId) return <div>loading...</div>;

  return <ProposalView spaceId={spaceId as string} proposalId={itemId as string} />;
};

function UserRadioButton ({userId, }: {userId: string}) {
  const user = api.user.getUser.useQuery({userId}).data;
  if(!user) return (<div>loading...</div>);
  return <Radio key={userId} value={userId} label={user.name} />;
}

export default ProposalPage;
