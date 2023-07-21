import { useRouter } from "next/router";
import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import {
  Button,
  Container,
  Text,
  Title,
  createStyles,
  Group,
  ThemeIcon,
  SimpleGrid,
  Alert,
} from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from "../../../../../components/SpaceNavBar";
import { AlternativeListItem } from "../../../../../components/AlternativeListItem";
import { SelectionStates } from "../../../../../utils/enums";
import { IconAlertCircle, IconColorSwatch } from "@tabler/icons";
import { DateTime } from "luxon";
import { UserLinkWithData } from "../../../../../components/UserButton";
import Link from "next/link";
import EditorJsRenderer from "../../../../../components/EditorJsRenderer";
import { SelectionStatusBadge } from "../../../../../components/SelectionStatusBadge";
import { useGeneralStyles } from "../../../../../styles/generalStyles";
import { SpaceLoader } from "../../../../../components/Loaders/SpaceLoader";
import dynamic from "next/dynamic";
const DynamicAlternativeEditor = dynamic(() => import('../../../../../components/AlternativeEditor'), {
  ssr: false,
})

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
  pointsText: {
    marginBottom: theme.spacing.md,
  },
}));

function SelectionView({
  spaceId,
  selectionId,
}: {
  spaceId: string;
  selectionId: string;
}) {
  const { classes } = useStyles();
  const { classes: generalClasses } = useGeneralStyles();
  const spaceResult = api.space.getSpace.useQuery({ spaceId });
  const selectionResult = api.selection.getSelection.useQuery({ selectionId });
  const voteResult = api.selection.getUserVotes.useQuery({ itemId: selectionId });

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

  if (spaceResult.isLoading) return <SpaceLoader />;
  if (!spaceResult.data) return <div>Could not load space</div>;
  const { space, isMember } = spaceResult.data;
  
  if (selectionResult.isLoading) return <SpaceLoader space={space} isMember={isMember} />;
  if (!selectionResult.data) return <div>Could not load proposal</div>;

  const selection = selectionResult.data;
  if (!selection) return <div>Could not load selection</div>;
  const {
    title,
    body,
    createdAt,
    updatedAt,
    creatorId,
    state,
  } = selection;


  return (
    <AppLayout>
      <Container size="sm">
        <SpaceNavBar space={space} isMember={isMember} />

        <Container size="sm" className={generalClasses.area}>
          <div className={generalClasses.metaArea}>
        <Group position="apart">
        <Group>
        <ThemeIcon size="xl">
          <IconColorSwatch />
          </ThemeIcon>
          <div>
          <Text fz="sm" fw={500} >Selection</Text>
        
          <Text fz="sm" fw={300} className={generalClasses.inlineText}>
            created{" "}
            <Text fz="sm" fw={500} className={classes.inlineText}>
              {DateTime.fromJSDate(createdAt).setLocale("en").toRelative()}
            </Text>
          </Text>

          <Text fz="sm" className={generalClasses.inlineText}>
            {" "}by{" "}
            <Text fz="sm" fw={500} className={classes.inlineText}>
              <UserLinkWithData userId={creatorId} />
            </Text>
          </Text>

          {updatedAt && updatedAt.getTime() !== createdAt.getTime() && (
            <Text fz="sm" fw={300} className={generalClasses.inlineText}>
              ,{" "}last updated{" "}
              <Text fz="sm" fw={500} className={classes.inlineText}>
                {DateTime.fromJSDate(updatedAt).setLocale("en").toRelative()}
              </Text>
            </Text>
          )}

          
        </div>
          </Group>
          <Group>
          <Link href={`/app/space/${spaceId}/selection/${selectionId}/edit`} passHref>
              <Button component="a">Edit</Button>
            </Link>
            {selection.state === SelectionStates.Created && (<Button
                  disabled={selection.alternatives.length < 3}
                  onClick={() => startBuyingRound.mutate({ selectionId })}
                >
                  Start vote
                </Button>)}
            
                {selection.state === SelectionStates.BuyingStarted && (
            <Button
              disabled={selection.alternatives.length < 3}
              onClick={() => endVoting.mutate({ selectionId })}
            >
              Finish vote
            </Button>
        )}

          </Group>
          
        </Group>
        </div>
        

        <div className={generalClasses.bodyArea}>
          <Group position="apart">
        
      <Title order={2} className={generalClasses.mainTitle}>{title}</Title>
      <SelectionStatusBadge state={state} />
        </Group>
        {body && <EditorJsRenderer data={body} />}
        </div>
        </Container>


        {selection.state === SelectionStates.Created && (
          <Container size="sm" className={classes.bodyArea}>
            <DynamicAlternativeEditor selectionId={selectionId} />
          </Container>
        )}

        <Container size="sm" className={generalClasses.clearArea}>
          <div className={generalClasses.listHeader}>
          <Title order={2} className={generalClasses.areaTitle}>
            Alternatives
          </Title>
          </div>
          

          {selection.state === SelectionStates.BuyingStarted &&
            voteResult.data &&
            voteResult.data.data && (
              <Text fz="sm" className={classes.pointsText}>
                You have{" "}
                <Text fz="sm" fw={500} className={classes.inlineText}>
                  {voteResult.data.data.leftToSpend
                    ? voteResult.data.data.leftToSpend
                    : 0}{" "}
                  points
                </Text>
                left to spend
              </Text>
            )}
          <SimpleGrid cols={1}>
          {selection.state === SelectionStates.Created && selection.alternatives.length < 3 &&  (<Alert icon={<IconAlertCircle size="1rem" />} title="More alternatives needed!" color="gray" variant="filled">
          Three alternatives are needed to start to voting.
          </Alert>)}

            {voteResult.data && voteResult.data.data
              ? selection.alternatives.map((alternative) => (
                  <AlternativeListItem
                    selectionState={state}
                    key={alternative.id}
                    showResults={
                      selection.state === SelectionStates.VoteClosed
                    }
                    alternative={alternative}
                    canVote={!!voteResult.data?.canBuyVotes}
                    currentVotingBalance={voteResult.data.data?.leftToSpend}
                    vote={voteResult.data.data?.votes.find(
                      (v) => v.alternativeId === alternative.id
                    )}
                  />
                ))
              : selection.alternatives.map((alternative) => (
                  <AlternativeListItem
                    selectionState={state}
                    showResults={
                      selection.state === SelectionStates.VoteClosed
                    }
                    key={alternative.id}
                    alternative={alternative}
                    canVote={!!voteResult.data?.canBuyVotes}
                  />
                ))}
          </SimpleGrid>
        </Container>

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
