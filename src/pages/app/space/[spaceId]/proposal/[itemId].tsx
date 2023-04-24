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

function ProposalView({
  spaceId,
  proposalId,
}: {
  spaceId: string;
  proposalId: string;
}) {
  const data = api.space.getSpace.useQuery({ spaceId }).data;
  const proposalResult = api.proposal.getProposal.useQuery({ proposalId });
  const closeObjectionRound = api.proposal.closeObjectionRound.useMutation({
    onSuccess: () => {
      void proposalResult.refetch();
    }
  });
  if (!data || !data.space) return <div>loading...</div>;
  const { space, isMember } = data;

  return (
    <AppLayout>
      <Container size="xs">
        <SpaceNavBar space={space} isMember={isMember} />

        {proposalResult.isLoading && <div>Loading...</div>}

        {!proposalResult.isLoading && !proposalResult.data && (
          <div>Content not found</div>
        )}

        {proposalResult.data && (
          <>
            <Text fz="lg" fw={500}>
              <Title order={2}>Proposal: {proposalResult.data.title}</Title>
            </Text>
            <Text>
              <div
                dangerouslySetInnerHTML={{ __html: proposalResult.data.body }}
              />
            </Text>
          </>
        )}
      </Container>
      <Container size="xs">
        {proposalResult.data?.proposalState === ProposalStates.ProposalCreated && <ObjectionEditor proposalId={proposalId} /> }
        <ListOfObjections objections={proposalResult.data?.objections || []} /> 
        {proposalResult.data?.objections.filter(o => !o.resolvedAt).length === 0 ? 
          <Button onClick={() => closeObjectionRound.mutate({proposalId})}>Start voting round</Button> : 
          <Button disabled={true}>Start voting round</Button>}        
      </Container>
      
      {proposalResult.data?.proposalState === ProposalStates.ObjectionsResolved && <Container size="xs">
        <Text fz="lg" fw={500}> 
        The voting round is now open.
        <Radio.Group
      name="favoriteFramework"
      label="Vote to accept or deny the proposal"
      description="Make your voice heard"
    >
      <Group mt="xs">
        <Radio value="Accept" label="Accept" />
        <Radio value="Deny" label="Deny" />
        <Radio value="Ignore" label="Ignore" />
      </Group>
    </Radio.Group>
    <Button>Vote</Button>
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

export default ProposalPage;
