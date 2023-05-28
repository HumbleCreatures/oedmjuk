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
} from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from "../../../../../components/SpaceNavBar";
import { AlternativeEditor } from "../../../../../components/AlternativeEditor";
import { AlternativeListItem } from "../../../../../components/AlternativeListItem";
import { SelectionStates } from "../../../../../utils/enums";
import { IconColorSwatch } from "@tabler/icons";
import { DateTime } from "luxon";
import { UserLinkWithData } from "../../../../../components/UserButton";
import Link from "next/link";

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

  if (selectionResult.isLoading || spaceResult.isLoading)
    return <div>loading...</div>;

  if (!spaceResult.data) return <div>Could not load space</div>;
  const { space, isMember } = spaceResult.data;

  if (!selectionResult.data) return <div>Could not load selection</div>;
  const selection = selectionResult.data;
  if (!selection) return <div>Could not load selection</div>;
  const {
    state,
    title,
    body,
    createdAt,
    updatedAt,
    creatorId,
  } = selection;

  return (
    <AppLayout>
      <Container size="sm">
        <SpaceNavBar space={space} isMember={isMember} />

        <Container size="sm">
          <Title order={2} className={classes.mainTitle}>
            {title}
          </Title>
        </Container>

        <Container size="sm" className={classes.area}>
          <Group position="apart">
            <Title order={2} className={classes.areaTitle}>
              Selection
            </Title>
            <ThemeIcon size="xl">
              <IconColorSwatch />
            </ThemeIcon>
          </Group>
          <div>
            <Text fz="sm" fw={300}>
              State:{" "}
              <Text fz="sm" fw={500} className={classes.inlineText}>
                {status}
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
          <Link href={`/app/space/${spaceId}/selection/${selectionId}/edit`} passHref>
              <Button component="a">Edit</Button>
            </Link>
        </Container>

        <Container size="sm" className={classes.bodyArea}>
          <div dangerouslySetInnerHTML={{ __html: body }} />
        </Container>

        {selection.state === SelectionStates.Created && (
          <Container size="sm" className={classes.bodyArea}>
            <AlternativeEditor selectionId={selectionId} />
          </Container>
        )}

        <Container size="sm" className={classes.area}>
          <Title order={2} className={classes.areaTitle}>
            Alternatives
          </Title>

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
            {voteResult.data && voteResult.data.data
              ? selection.alternatives.map((alternative) => (
                  <AlternativeListItem
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

        {selection.state === SelectionStates.Created && (
          <Container size="sm" className={classes.area}>
            <SimpleGrid cols={1}>
              <div>
                <Button
                  disabled={selection.alternatives.length < 3}
                  onClick={() => startBuyingRound.mutate({ selectionId })}
                >
                  Start buying votes
                </Button>
              </div>

              {selection.alternatives.length < 3 && (
                <Text>You need three alternatives to start to vote</Text>
              )}
            </SimpleGrid>
          </Container>
        )}

        {selection.state === SelectionStates.BuyingStarted && (
          <Container size="sm" className={classes.area}>
            <Button
              disabled={selection.alternatives.length < 3}
              onClick={() => endVoting.mutate({ selectionId })}
            >
              Finish buying votes
            </Button>
          </Container>
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
