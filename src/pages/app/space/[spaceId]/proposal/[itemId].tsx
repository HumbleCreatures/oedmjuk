import { useRouter } from "next/router";
import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import {
  Container,
  Text,
  Title,
  createStyles,
  Button,
  Radio,
  Group,
  ThemeIcon,
  SimpleGrid,
} from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from "../../../../../components/SpaceNavBar";
import { ObjectionEditor } from "../../../../../components/ObjectionEditor";
import { ListOfObjections } from "../../../../../components/ObjectionList";
import { ProposalStates } from "../../../../../utils/enums";
import { useState } from "react";
import { VoteValue } from "../../../../../utils/enums";
import { IconNotebook } from "@tabler/icons";
import type { Proposal } from "@prisma/client";
import { DateTime } from "luxon";
import { UserLinkWithData } from "../../../../../components/UserButton";
import Link from "next/link";
import EditorJsRenderer from "../../../../../components/EditorJsRenderer";

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
}));

function ProposalView({
  spaceId,
  proposalId,
}: {
  spaceId: string;
  proposalId: string;
}) {
  const { classes } = useStyles();
  const spaceReslt = api.space.getSpace.useQuery({ spaceId });
  const proposalResult = api.proposal.getProposal.useQuery({ itemId: proposalId });
  const voteResult = api.proposal.getUserVote.useQuery({ proposalId });
  const closeObjectionRound = api.proposal.closeObjectionRound.useMutation({
    onSuccess: () => {
      void proposalResult.refetch();
    },
  });

  const endVoting = api.proposal.endVoting.useMutation({
    onSuccess: () => {
      void proposalResult.refetch();
    },
  });

  const castVote = api.proposal.castVote.useMutation({
    onSuccess: () => {
      void proposalResult.refetch();
      void voteResult.refetch();
    },
  });

  const [voteState, setVoteState] = useState<{
    voteValue?: VoteValue;
    myPickId?: string;
    myPickChosen: boolean;
    voteAgain?: boolean;
  }>({ myPickChosen: false });

  if (proposalResult.isLoading || spaceReslt.isLoading)
    return <div>loading...</div>;

  if (!spaceReslt.data) return <div>Could not load space</div>;
  const { space, isMember } = spaceReslt.data;

  if (!proposalResult.data) return <div>Could not load proposal</div>;
  const { proposal, votingResult, myPickResults } = proposalResult.data;
  if (!proposal) return <div>Could not load proposal</div>;
  const { objections, proposalState, title, body, participants } = proposal;

  if (proposal.proposalState === ProposalStates.VoteClosed) {
    if (!votingResult) return <div>Could not load voting result</div>;
    const {
      numberOfAbstains,
      numberOfParticipants,
      numberOfVotes,
      numberOfAccepts,
      numberOfRejects,
      numberOfMissedVotes,
    } = votingResult;
    return (
      <AppLayout>
        <Container size="sm">
          <SpaceNavBar space={space} isMember={isMember} />
          <ProposalInfo proposal={proposal} />

          <Container size="sm" className={classes.area}>
            <Title order={3} className={classes.areaTitle}>
              Objections
            </Title>
            <ListOfObjections objections={objections || []} />
          </Container>
          <Container size="sm" className={classes.area}>
            <Title order={3} className={classes.areaTitle}>
              Vote results
            </Title>
            <Text fz="md" fw={300}>
              <Text fz="md" fw={500} className={classes.inlineText}>
                {numberOfParticipants}
              </Text>{" "}
              participants could have voted
            </Text>
            <Text fz="md" fw={300}>
              <Text fz="md" fw={500} className={classes.inlineText}>
                {numberOfVotes}
              </Text>{" "}
              participants voted
            </Text>
            <Text fz="md" fw={300}>
              <Text fz="md" fw={500} className={classes.inlineText}>
                {numberOfAccepts}
              </Text>{" "}
              participants accepted the proposal
            </Text>
            <Text fz="md" fw={300}>
              <Text fz="md" fw={500} className={classes.inlineText}>
                {numberOfRejects}
              </Text>{" "}
              participants rejected the proposal
            </Text>
            <Text fz="md" fw={300}>
              <Text fz="md" fw={500} className={classes.inlineText}>
                {numberOfAbstains}
              </Text>{" "}
              participants abstained
            </Text>
            <Text fz="md" fw={300}>
              <Text fz="md" fw={500} className={classes.inlineText}>
                {numberOfMissedVotes}
              </Text>{" "}
              participants did not vote
            </Text>

            <Title order={3} className={classes.areaTitle}>
              Expert Vote results
            </Title>
            <Text fz="md" fw={300}>
              <Text fz="md" fw={500} className={classes.inlineText}>
                {myPickResults.numberOfAccepts}
              </Text>{" "}
              experts accepted the proposal
            </Text>
            <Text fz="md" fw={300}>
              <Text fz="md" fw={500} className={classes.inlineText}>
                {myPickResults.numberOfRejects}
              </Text>{" "}
              experts rejected the proposal
            </Text>
            <Text fz="md" fw={300}>
              <Text fz="md" fw={500} className={classes.inlineText}>
                {myPickResults.numberOfAbstains}
              </Text>{" "}
              experts abstained
            </Text>
            <Text fz="md" fw={300}>
              <Text fz="md" fw={500} className={classes.inlineText}>
                {myPickResults.numberOfMissedVotes}
              </Text>{" "}
              experts did not vote
            </Text>
            

          </Container>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container size="sm">
        <SpaceNavBar space={space} isMember={isMember} />
        <ProposalInfo proposal={proposal} />

        {proposalState === ProposalStates.ProposalCreated && (
          <Container size="sm" className={classes.bodyArea}>
            <ObjectionEditor proposalId={proposalId} />
          </Container>
        )}

        <Container size="sm" className={classes.area}>
          <Title order={3} className={classes.areaTitle}>
            Objections
          </Title>
          <ListOfObjections objections={objections || []} />
        </Container>

        {proposalState === ProposalStates.ProposalCreated && (
          <Container size="sm" className={classes.area}>
            {objections.filter((o) => !o.resolvedAt).length === 0 ? (
              <Button
                onClick={() => closeObjectionRound.mutate({ proposalId })}
              >
                Start voting round
              </Button>
            ) : (
              <Button disabled={true}>Start voting round</Button>
            )}
          </Container>
        )}

        {proposalState === ProposalStates.ObjectionsResolved && (
          <>
            <Container size="sm" className={classes.area}>
              <Title order={3} className={classes.areaTitle}>
                The voting round is open
              </Title>
              <SimpleGrid cols={1}>
                {voteResult.data && !voteState.voteAgain && (
                  <>
                    <Text>You have already voted.</Text>
                    <div>
                      <Button
                        mt="sm"
                        onClick={() =>
                          setVoteState({ ...voteState, voteAgain: true })
                        }
                      >
                        Make new vote
                      </Button>
                    </div>
                  </>
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
                      <SimpleGrid cols={1}>
                        {participants.map((p) => (
                          <UserRadioButton
                            key={p.participantId}
                            userId={p.participantId}
                          />
                        ))}
                        <Radio value="none" label="No one" />
                      </SimpleGrid>
                    </Radio.Group>
                    <div>
                      <Button
                        disabled={
                          !voteState.voteValue || !voteState.myPickChosen
                        }
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
                    </div>
                  </>
                )}
              </SimpleGrid>
            </Container>
            <Container size="sm" className={classes.area}>
              <Button onClick={() => endVoting.mutate({ proposalId })}>
                End vote and show results
              </Button>
            </Container>
          </>
        )}
      </Container>
    </AppLayout>
  );
}
const ProposalPage: NextPage = () => {
  const router = useRouter();

  const { spaceId, itemId } = router.query;
  if (!spaceId || !itemId) return <div>loading...</div>;

  return (
    <ProposalView spaceId={spaceId as string} proposalId={itemId as string} />
  );
};

function UserRadioButton({ userId }: { userId: string }) {
  const user = api.user.getUser.useQuery({ userId }).data;
  if (!user) return <div>loading...</div>;
  return <Radio key={userId} value={userId} label={user.name} />;
}

export default ProposalPage;

function ProposalInfo({ proposal }: { proposal: Proposal }) {
  const { classes } = useStyles();
  const { title, body, createdAt, creatorId, updatedAt, proposalState } =
    proposal;
  return (
    <>
      <Container size="sm">
        <Title order={2} className={classes.mainTitle}>
          {title}
        </Title>
      </Container>

      <Container size="sm" className={classes.area}>
        <Group position="apart">
          <Title order={2} className={classes.areaTitle}>
            Proposal
          </Title>
          <ThemeIcon size="xl">
            <IconNotebook />
          </ThemeIcon>
        </Group>
        <div>
          <Text fz="sm" fw={300}>
            State:{" "}
            <Text fz="sm" fw={500} className={classes.inlineText}>
              {proposalState}
            </Text>
          </Text>
          <Text fz="sm" fw={300}>
            Created{" "}
            <Text fz="sm" fw={500} className={classes.inlineText}>
              {DateTime.fromJSDate(createdAt).setLocale("en").toRelative()}
            </Text>
          </Text>

          {updatedAt && updatedAt.getTime() !== createdAt.getTime() && (
            <Text fz="sm" fw={300}>
              Last updated{" "}
              <Text fz="sm" fw={500} className={classes.inlineText}>
                {DateTime.fromJSDate(updatedAt).setLocale("en").toRelative()}
              </Text>
            </Text>
          )}

          <Text fz="sm">
            By{" "}
            <Text fz="sm" fw={500} className={classes.inlineText}>
              <UserLinkWithData userId={creatorId} />
            </Text>
          </Text>
        </div>

        <Link href={`/app/space/${proposal.spaceId}/proposal/${proposal.id}/edit`} passHref>
              <Button component="a">Edit</Button>
            </Link>
      </Container>
      <Container size="sm" className={classes.bodyArea}>{body && <EditorJsRenderer data={body} />}</Container>
    </>
  );
}
