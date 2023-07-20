import { useRouter } from "next/router";
import { type NextPage } from "next";
import AppLayout from "../../../../components/AppLayout";
import {
  Container,
  Title,
  SimpleGrid,
  createStyles,
  Card,
  Text,
  Group,
  Tabs,
  Badge,
} from "@mantine/core";
import { api } from "../../../../utils/api";
import { SpaceNavBar } from "../../../../components/SpaceNavBar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { DateTime } from "luxon";
import Link from "next/link";
import { IconNotebook } from "@tabler/icons";
import { useGeneralStyles } from "../../../../styles/generalStyles";
import { Proposal } from "@prisma/client";
import { ProposalStates } from "../../../../utils/enums";
import { ProposalStatusBadge } from "../../../../components/ProposalBadge";
import { SpaceLoader } from "../../../../components/Loaders/SpaceLoader";

const useStyles = createStyles((theme) => ({
  area: {
    backgroundColor: theme.colors.gray[4],
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  areaTitle: {
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.md,
  },
  inlineText: {
    display: "inline",
  },
  title: {
    fontSize: theme.fontSizes.md,
  },
  titleWrapper: {
    marginBottom: theme.spacing.md,
  }
}));

function SpaceView({ spaceId }: { spaceId: string }) {
  const { classes } = useStyles();
  const { classes: generalClasses } = useGeneralStyles();

  const spaceResult = api.space.getSpace.useQuery({ spaceId });
  const proposalResult = api.proposal.getSpaceProposals.useQuery({ spaceId });
  if (spaceResult.isLoading) return <SpaceLoader />;
  if (!spaceResult.data)
    return <div>Could not find space</div>;
  const { space, isMember } = spaceResult.data;
  if (proposalResult.isLoading) return <SpaceLoader space={space} isMember={isMember} />;
  if (!proposalResult.data)
    return <div>Could not find content pages</div>;

  const openProposals = proposalResult.data.filter(p => p.proposalState === ProposalStates.ProposalOpen);
  const votingProposals = proposalResult.data.filter(p => p.proposalState === ProposalStates.ObjectionsResolved);
  const finishedProposals = proposalResult.data.filter(p => p.proposalState === ProposalStates.VoteClosed);
  const draftProposals = proposalResult.data.filter(p => p.proposalState === ProposalStates.ProposalCreated);

  return (
    <AppLayout>
      <Container size="sm">
        <SpaceNavBar space={space} isMember={isMember} />
        <Container size="sm" className={generalClasses.clearArea}>
          <Group className={classes.titleWrapper}>
            <IconNotebook />
            <Title order={2} className={classes.title}>
              Proposals
            </Title>
          </Group>
          <Tabs defaultValue="open" 
          styles={(theme) => ({
            tabsList: {
              border: 'none',
            },
            tab: { 
              color: theme.white,
              marginBottom: theme.spacing.xs,
              borderColor: theme.colors.earth[2],
              borderRadius: 0,
              '&[right-section]': {
                backgroundColor: theme.fn.rgba(theme.white, 0.1),
               },
              '&:hover': {
                backgroundColor: theme.fn.rgba(theme.white, 0.05),
                borderColor: theme.colors.earth[2],
              },
              '&[data-active]': {
                backgroundColor: theme.fn.rgba(theme.white, 0.1),
                borderColor: theme.white,
                color: theme.white,
              },
              '&[data-active]:hover': {
                backgroundColor: theme.fn.rgba(theme.white, 0.1),
                borderColor: theme.white,
                color: theme.white,
              },
            }
          })}>
      <Tabs.List grow>
        <Tabs.Tab
          rightSection={
            <Badge
              w={16}
              h={16}
              sx={{ pointerEvents: 'none' }}
              size="xs"
              p={0}
              
            >
              {openProposals.length}
            </Badge>
          }
          value="open"
        >
          Open
        </Tabs.Tab>
        <Tabs.Tab value="voting"
        rightSection={
          <Badge
            w={16}
            h={16}
            sx={{ pointerEvents: 'none' }}
            size="xs"
            p={0}
            
          >
            {votingProposals.length}
          </Badge>
        }>Voting</Tabs.Tab>
        <Tabs.Tab value="finished"
        rightSection={
          <Badge
            w={16}
            h={16}
            sx={{ pointerEvents: 'none' }}
            size="xs"
            p={0}
            
          >
            {finishedProposals.length}
          </Badge>
        }>Finished</Tabs.Tab>
        <Tabs.Tab value="drafts"
        rightSection={
          <Badge
            w={16}
            h={16}
            sx={{ pointerEvents: 'none' }}
            size="xs"
            p={0}
            
          >
            {draftProposals.length}
          </Badge>
        }>Drafts</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="open">
       <ProposalList proposals={openProposals} />
      </Tabs.Panel>
      <Tabs.Panel value="voting">
      <ProposalList proposals={votingProposals} />
      </Tabs.Panel>
      <Tabs.Panel value="finished">
      <ProposalList proposals={finishedProposals} />
      </Tabs.Panel>
      <Tabs.Panel value="drafts">
      <ProposalList proposals={draftProposals} />
      </Tabs.Panel>
    </Tabs>


        </Container>
      </Container>
    </AppLayout>
  );
}

function ProposalList ({proposals}: {proposals: Proposal[]}) {
  const { classes } = useStyles();
  const { classes: generalClasses } = useGeneralStyles(); 
  return (<SimpleGrid cols={1}>
    {proposals.map((proposal) => (
      <Link
        href={`/app/space/${proposal.spaceId}/proposal/${proposal.id}`}
        key={proposal.id}
        className={generalClasses.listLinkItem}
      >
        <Card>
          <Group position="apart">
            <Text fz="lg" fw={500}>
              {proposal.title}
            </Text>
            <ProposalStatusBadge state={proposal.proposalState} />
          </Group>
          
          <div>


            <Text fz="sm" fw={300}>
              Created{" "}
              <Text fz="sm" fw={500} className={classes.inlineText}>
                {DateTime.fromJSDate(proposal.createdAt)
                  .setLocale("en")
                  .toRelative()}
              </Text>
            </Text>

            {proposal.updatedAt &&
              proposal.updatedAt.getTime() !==
                proposal.createdAt.getTime() && (
                <Text fz="sm" fw={300}>
                  Last updated{" "}
                  <Text fz="sm" fw={500} className={classes.inlineText}>
                    {DateTime.fromJSDate(proposal.updatedAt)
                      .setLocale("en")
                      .toRelative()}
                  </Text>
                </Text>
              )}
          </div>
        </Card>
      </Link>
    ))}
  </SimpleGrid>)
}
const LoadingSpaceView: NextPage = () => {
  const router = useRouter();

  const { spaceId } = router.query;
  if (!spaceId) return <div>loading...</div>;

  return <SpaceView spaceId={spaceId as string} />;
};

export default LoadingSpaceView;
