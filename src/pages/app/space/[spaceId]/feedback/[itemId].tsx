import { useRouter } from "next/router";
import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import {
  Container,
  Text,
  Title,
  createStyles,
  Group,
  ThemeIcon,
  Grid,
  Button,
  SimpleGrid,
} from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from "../../../../../components/SpaceNavBar";
import { FeedbackItemEditor } from "../../../../../components/FeedbackItemEditor";
import { ExternalFeedbackItemCardList } from "../../../../../containers/ExternalFeedbackItemCardList";
import { MyFeedbackItemCardList } from "../../../../../containers/MyFeedbackItemCardList";
import { FeedbackColumns } from "../../../../../components/FeedbackColumns";
import { IconRecycle } from "@tabler/icons";
import { DateTime } from "luxon";
import { UserLinkWithData } from "../../../../../components/UserButton";
import { useState } from "react";
import Link from "next/link";
import { FeedbackRoundStates } from "../../../../../utils/enums";
import { NamedFeedbackItemCardList } from "../../../../../containers/NamedFeedbackItemCardList";

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
  itemColumn: {
    backgroundColor: theme.colors.gray[4],
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  editColumnSection: {
    backgroundColor: theme.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  itemColumnContainer: {
    marginTop: theme.spacing.xl,
  },
  alignItemsStart: {
    alignItems: "start"
  }
}));

function FeedbackView({
  spaceId,
  feedbackRoundId,
}: {
  spaceId: string;
  feedbackRoundId: string;
}) {
  const { classes } = useStyles();
  const spaceResult = api.space.getSpace.useQuery({ spaceId });
  const feedbackResult = api.feedback.getFeedbackRound.useQuery({
    itemId: feedbackRoundId,
  });
  const utils = api.useContext();
  const closeMutation = api.feedback.closeFeedbackRound.useMutation( {
    onSuccess: () => { 
      void utils.feedback.getFeedbackRound.invalidate({ itemId: feedbackRoundId });
    }
  });

  const startMutation = api.feedback.startFeedbackRound.useMutation( {
    onSuccess: () => { 
      void utils.feedback.getFeedbackRound.invalidate({ itemId: feedbackRoundId });
    }
  });

  if (feedbackResult.isLoading || spaceResult.isLoading)
    return <div>loading...</div>;

  if (!spaceResult.data) return <div>Could not load space</div>;
  const { space, isMember } = spaceResult.data;

  if (!feedbackResult.data) return <div>Could not load feedback round</div>;
  const feedbackRound = feedbackResult.data;
  const { title, body, createdAt, creatorId, updatedAt, state } = feedbackRound;

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
              Feedback round
            </Title>
            <ThemeIcon size="xl">
              <IconRecycle />
            </ThemeIcon>
          </Group>
          <div>
            <Text fz="sm" fw={300}>
              State:{" "}
              <Text fz="sm" fw={500} className={classes.inlineText}>
                {state}
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
          <Group>
          <Link href={`/app/space/${spaceId}/feedback/${feedbackRoundId}/edit`} passHref>
              <Button component="a">Edit</Button>
            </Link>
            {feedbackRound.state === FeedbackRoundStates.Created && <Button onClick={() => startMutation.mutate({itemId: feedbackRoundId})}>Start feedback round</Button>}
            {feedbackRound.state === FeedbackRoundStates.Started &&<Button onClick={() => closeMutation.mutate({itemId: feedbackRoundId})}>Close feedback round</Button>}
            
            </Group>
        </Container>

        <Container size="sm" className={classes.bodyArea}>
          <div dangerouslySetInnerHTML={{ __html: body }} />
        </Container>
      </Container>
      <Container size="sm" className={classes.bodyArea}>
              <Title order={3} className={classes.areaTitle}>
                Current item being discussed
              </Title>

              <NamedFeedbackItemCardList
                feedbackRoundId={feedbackRoundId}
                feedbackColumns={feedbackRound.feedbackColumns}
                feedbackRound={feedbackRound}
                columnName="Ongoing"
              />
      </Container>
      
      <Container size="sm" className={classes.itemColumnContainer}>
        <Group position="center" className={classes.alignItemsStart} >

        {feedbackRound.state !== FeedbackRoundStates.Closed && <div className={classes.editColumnSection}>
                <FeedbackItemEditor feedbackRoundId={feedbackRoundId} />
            </div>}
            <div className={classes.itemColumn}>
              <Title order={3} className={classes.areaTitle}>
                My feedback items
              </Title>
              <MyFeedbackItemCardList
                feedbackRoundId={feedbackRoundId}
                feedbackColumns={feedbackRound.feedbackColumns}
                feedbackRound={feedbackRound}
              />
            </div>
            
            
        </Group>

        
      </Container>


      <Container size="sm" className={classes.area}>

              <Title order={3} className={classes.areaTitle}>
                External feedback items
              </Title>
              <Group position="center" className={classes.alignItemsStart}>
              <ExternalFeedbackItemCardList
                feedbackRoundId={feedbackRoundId}
                feedbackColumns={feedbackRound.feedbackColumns}
                feedbackRound={feedbackRound}
              />
              </Group>
      </Container>

      <Container size="sm" className={classes.area}>

              <Title order={3} className={classes.areaTitle}>
                Archived items
              </Title>
              <Group position="center" className={classes.alignItemsStart}>
              <NamedFeedbackItemCardList
                feedbackRoundId={feedbackRoundId}
                feedbackColumns={feedbackRound.feedbackColumns}
                feedbackRound={feedbackRound}
                columnName="Done"
              />
              </Group>
      </Container>
    </AppLayout>
  );
}
const FeedbackPage: NextPage = () => {
  const router = useRouter();

  const { spaceId, itemId } = router.query;
  if (!spaceId || !itemId) return <div>loading...</div>;

  return (
    <FeedbackView
      spaceId={spaceId as string}
      feedbackRoundId={itemId as string}
    />
  );
};

export default FeedbackPage;
