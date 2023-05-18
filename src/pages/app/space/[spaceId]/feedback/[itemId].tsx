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
    width: 300,
  },
  editColumnSection: {
    backgroundColor: theme.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    width: 300,
    marginTop: theme.spacing.md,
  },
  itemColumnContainer: {
    width: 1300,
    maxWidth: 1300,
    marginTop: theme.spacing.xl,
  },
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
  const [showEditor, setShowEditor] = useState(false);

  if (feedbackResult.isLoading || spaceResult.isLoading)
    return <div>loading...</div>;

  if (!spaceResult.data) return <div>Could not load space</div>;
  const { space, isMember } = spaceResult.data;

  if (!feedbackResult.data) return <div>Could not load feedback round</div>;
  const feedbackRound = feedbackResult.data;
  const { title, body, createdAt, creatorId, updatedAt, status } = feedbackRound;

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
        </Container>

        <Container size="sm" className={classes.bodyArea}>
          <div dangerouslySetInnerHTML={{ __html: body }} />
        </Container>
      </Container>
      <Container className={classes.itemColumnContainer}>
        <Grid gutter="md">
          <Grid.Col span={3}>
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
            <div className={classes.editColumnSection}>
              {!showEditor && (
                <Button onClick={() => setShowEditor(true)}>Add item</Button>
              )}
              {showEditor && (
                <FeedbackItemEditor feedbackRoundId={feedbackRoundId} />
              )}
            </div>
          </Grid.Col>
          <Grid.Col span={3}>
            <div className={classes.itemColumn}>
              <Title order={3} className={classes.areaTitle}>
                External feedback items
              </Title>
              <ExternalFeedbackItemCardList
                feedbackRoundId={feedbackRoundId}
                feedbackColumns={feedbackRound.feedbackColumns}
                feedbackRound={feedbackRound}
              />
            </div>
          </Grid.Col>

          <FeedbackColumns
            feedbackColumns={feedbackRound.feedbackColumns}
            feedbackRound={feedbackRound}
          />
        </Grid>
      </Container>

      <Container></Container>
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
