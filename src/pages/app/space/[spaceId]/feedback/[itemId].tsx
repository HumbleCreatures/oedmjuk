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
  Button,
  Center,
  Alert,
  Tabs,
  Badge,
  SimpleGrid,
} from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from "../../../../../components/SpaceNavBar";
import { IconAlertCircle, IconRecycle } from "@tabler/icons";
import { DateTime } from "luxon";
import { UserLinkWithData } from "../../../../../components/UserButton";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChannelEventTypes, EventChannels, FeedbackRoundStates } from "../../../../../utils/enums";
import { NamedFeedbackItemCardList } from "../../../../../containers/NamedFeedbackItemCardList";
import Pusher from 'pusher-js';
import { env } from "../../../../../env/client.mjs";
import EditorJsRenderer from "../../../../../components/EditorJsRenderer";
import { SpaceLoader } from "../../../../../components/Loaders/SpaceLoader";
import { useGeneralStyles } from "../../../../../styles/generalStyles";
import { FeedbackRoundStatusBadge } from "../../../../../components/FeedbackRoundStatusBadge";
import { FeedbackItemCardList } from "../../../../../components/FeedbackItemCardList";
import dynamic from "next/dynamic";

const DynamicFeedbackEditor = dynamic(() => import('../../../../../components/FeedbackItemEditor'), {
  ssr: false,
})

Pusher.logToConsole = true;

const pusher = new Pusher(env.NEXT_PUBLIC_PUHSER_KEY, {
  cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER
});

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
  focusTitle: {
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.xs,
    color: theme.white
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
  },
  focusArea: {
    backgroundColor: theme.colors.earth[9],
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  alertCreated: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
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
  const { classes: generalClasses } = useGeneralStyles();
  const spaceResult = api.space.getSpace.useQuery({ spaceId });
  const feedbackResult = api.feedback.getFeedbackRound.useQuery({
    itemId: feedbackRoundId,
  });
  const myFeedbackItemsResult = api.feedback.getMyFeedbackItems.useQuery({ itemId: feedbackRoundId });
  const externalFeedbackItemsResult = api.feedback.getExternalFeedbackItems.useQuery({ itemId: feedbackRoundId });
  const archiveFeedbackItemsResult = api.feedback.getNamedFeedbackItems.useQuery({ itemId: feedbackRoundId, columnName: "Done" });
  
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

  useEffect(() => {
    const channel = pusher.subscribe(EventChannels.FeedbackRound + feedbackRoundId);
    channel.bind(ChannelEventTypes.FeedbackItemMoved, function(data:any) {
      void utils.feedback.getFeedbackRound.invalidate({ itemId: feedbackRoundId });
      void utils.feedback.getNamedFeedbackItems.refetch({ itemId: feedbackRoundId, columnName: "Done" });
      void utils.feedback.getExternalFeedbackItems.invalidate({ itemId: feedbackRoundId });
      void utils.feedback.getMyFeedbackItems.invalidate({ itemId: feedbackRoundId });
      void utils.feedback.getNamedFeedbackItems.refetch({ itemId: feedbackRoundId, columnName: "Ongoing" });
    });
  }, [pusher]);


  if (spaceResult.isLoading) return <SpaceLoader />;
  if (!spaceResult.data) return <div>Could not load space</div>;
  const { space, isMember } = spaceResult.data;
  
  if (feedbackResult.isLoading) return <SpaceLoader space={space} isMember={isMember} />;
  if (!feedbackResult.data) return <div>Could not load feedback result</div>;

  if (myFeedbackItemsResult.isLoading) return <SpaceLoader space={space} isMember={isMember} />;
  if (!myFeedbackItemsResult.data) return <div>Could not load my feedback items</div>;
  if (externalFeedbackItemsResult.isLoading) return <SpaceLoader space={space} isMember={isMember} />;
  if (!externalFeedbackItemsResult.data) return <div>Could not load my feedback items</div>;
  if (archiveFeedbackItemsResult.isLoading) return <SpaceLoader space={space} isMember={isMember} />;
  if (!archiveFeedbackItemsResult.data) return <div>Could not load my feedback items</div>;


  const feedbackRound = feedbackResult.data;
  const { title, body, createdAt, creatorId, updatedAt, state } = feedbackRound;

  return (
    <AppLayout>
      <Container size="sm">
        <SpaceNavBar space={space} isMember={isMember} />

        <Container size="sm" className={generalClasses.area}>
          <div className={generalClasses.metaArea}>
        <Group position="apart" className={generalClasses.topGroup}>
          <Group className={generalClasses.topGroup}>
        <ThemeIcon size="xl">
        <IconRecycle />
          </ThemeIcon>
          <div>
          <Text fz="sm" fw={500} >Feedback round</Text>
        
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
            <Text fz="sm" fw={300}>
             last updated{" "}
              <Text fz="sm" fw={500} className={classes.inlineText}>
                {DateTime.fromJSDate(updatedAt).setLocale("en").toRelative()}
              </Text>
            </Text>
          )}

          
        </div>
          </Group>
          <Group position="right" spacing="xs" className={generalClasses.topGroup}>
          <Link href={`/app/space/${spaceId}/feedback/${feedbackRoundId}/edit`} passHref>
              <Button component="a">Edit</Button>
            </Link>

            {feedbackRound.state === FeedbackRoundStates.Created && <Button onClick={() => startMutation.mutate({itemId: feedbackRoundId})}>Start feedback round</Button>}
            {feedbackRound.state === FeedbackRoundStates.Started &&<Button onClick={() => closeMutation.mutate({itemId: feedbackRoundId})}>Close feedback round</Button>}


          </Group>
          
        </Group>
        </div>
        
        <div className={generalClasses.bodyArea}>
          <Group position="apart" className={generalClasses.topGroup}>
          <div>
          <Title order={2} className={generalClasses.mainTitle}>{title}</Title>
          
          </div>

          <FeedbackRoundStatusBadge state={state} />

        </Group>
        
        {body && <EditorJsRenderer data={body} />}
        </div>
        </Container>
          {state === FeedbackRoundStates.Created &&  (<Alert className={classes.alertCreated}  icon={<IconAlertCircle size="1rem" />} title="Feedback round is not started yet!" color="gray" variant="filled">
          You can create feedback items, but they will not be visible to other users until you move them to ongoing or done.
          External feedback items are always visible.
          </Alert>)}

          {state === FeedbackRoundStates.Started && <Container size="sm" className={classes.focusArea}>
              <Center><Title order={3} className={classes.focusTitle}>
                Current item being discussed
              </Title></Center>

              <Center>
                <NamedFeedbackItemCardList
                feedbackRoundId={feedbackRoundId}
                feedbackColumns={feedbackRound.feedbackColumns}
                feedbackRound={feedbackRound}
                columnName="Ongoing"
              />
               
              </Center>
      </Container> }

      <Tabs 
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
          })}
          defaultValue="myItems">
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
              {myFeedbackItemsResult.data.length}
            </Badge>
          }
          value="myItems"
        >
          My items
        </Tabs.Tab>
        <Tabs.Tab value="external"
        rightSection={
          <Badge
            w={16}
            h={16}
            sx={{ pointerEvents: 'none' }}
            size="xs"
            p={0}
            
          >
            {externalFeedbackItemsResult.data.length}
          </Badge>
        }>External feedback</Tabs.Tab>
        <Tabs.Tab value="archive"
        rightSection={
          <Badge
            w={16}
            h={16}
            sx={{ pointerEvents: 'none' }}
            size="xs"
            p={0}
          >
            {archiveFeedbackItemsResult.data.length}
          </Badge>
        }>Archived (Done)</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="myItems">
      <SimpleGrid cols={2} className={classes.alignItemsStart} >

        {feedbackRound.state !== FeedbackRoundStates.Closed &&
                <DynamicFeedbackEditor feedbackRoundId={feedbackRoundId} />
           }
              <FeedbackItemCardList
                feedbackColumns={feedbackRound.feedbackColumns}
                feedbackRound={feedbackRound}
                feedbackItems={myFeedbackItemsResult.data}
              />
        </SimpleGrid>
      </Tabs.Panel>
      <Tabs.Panel value="external">
      <Group position="center" className={classes.alignItemsStart}>
            <FeedbackItemCardList
                feedbackColumns={feedbackRound.feedbackColumns}
                feedbackRound={feedbackRound}
                feedbackItems={externalFeedbackItemsResult.data}
              />
              </Group>
      </Tabs.Panel>
      <Tabs.Panel value="archive">
      <Group position="center" className={classes.alignItemsStart}>
      <FeedbackItemCardList
                feedbackColumns={feedbackRound.feedbackColumns}
                feedbackRound={feedbackRound}
                feedbackItems={archiveFeedbackItemsResult.data}
              />
              </Group>
      </Tabs.Panel>
    </Tabs>

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
