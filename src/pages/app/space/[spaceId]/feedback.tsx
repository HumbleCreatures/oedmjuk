import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../../components/AppLayout";
import { Container, Title, SimpleGrid, createStyles, Card, Text, Group, Tabs, Badge } from "@mantine/core";
import { api } from "../../../../utils/api";
import { SpaceNavBar } from '../../../../components/SpaceNavBar';
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { DateTime } from "luxon";
import Link from 'next/link';
import { useGeneralStyles } from '../../../../styles/generalStyles';
import { SpaceLoader } from '../../../../components/Loaders/SpaceLoader';
import { FeedbackRoundStates } from '../../../../utils/enums';
import { IconRecycle } from '@tabler/icons';
import { FeedbackRound } from '@prisma/client';
import { FeedbackRoundStatusBadge } from '../../../../components/FeedbackRoundStatusBadge';



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
  titleWrapper: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.md,
  }
}));

function SpaceView({spaceId}: {spaceId: string}) {
  const { classes } = useStyles();
  const { classes: generalClasses } = useGeneralStyles(); 
  

  const spaceResult = api.space.getSpace.useQuery({spaceId});
  const feedbackResult = api.feedback.getFeedbackRoundsForSpace.useQuery({spaceId});
  if (spaceResult.isLoading) return <SpaceLoader />;
  if (!spaceResult.data)
    return <div>Could not find space</div>;
  const { space, isMember } = spaceResult.data;
  if (feedbackResult.isLoading) return <SpaceLoader space={space} isMember={isMember} />;
  if (!feedbackResult.data)
    return <div>Could not find feedback</div>;

  const createdFeedback = feedbackResult.data.filter((selection) => selection.state === FeedbackRoundStates.Created);
  const openFeedback = feedbackResult.data.filter((selection) => selection.state === FeedbackRoundStates.Started);
  const closedFeedback = feedbackResult.data.filter((selection) => selection.state === FeedbackRoundStates.Closed);


  return (
    <AppLayout>
      <Container size="sm">
      <SpaceNavBar space={space} isMember={isMember}/>
      
      <Container size="sm" className={generalClasses.clearArea}>
          <Group className={classes.titleWrapper}>
          <IconRecycle />
            <Title order={2} className={classes.title}>
              Feedback rounds
            </Title>
          </Group>
      </Container>
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
              {openFeedback.length}
            </Badge>
          }
          value="open"
        >
          Open
        </Tabs.Tab>
        <Tabs.Tab value="created"
        rightSection={
          <Badge
            w={16}
            h={16}
            sx={{ pointerEvents: 'none' }}
            size="xs"
            p={0}
            
          >
            {createdFeedback.length}
          </Badge>
        }>Created</Tabs.Tab>
        <Tabs.Tab value="closed"
        rightSection={
          <Badge
            w={16}
            h={16}
            sx={{ pointerEvents: 'none' }}
            size="xs"
            p={0}
            
          >
            {closedFeedback.length}
          </Badge>
        }>Closed</Tabs.Tab>

      </Tabs.List>
      <Tabs.Panel value="open">
       <FeedbackList feedbackRound={openFeedback} />
      </Tabs.Panel>
      <Tabs.Panel value="created">
      <FeedbackList feedbackRound={createdFeedback} />
      </Tabs.Panel>
      <Tabs.Panel value="closed">
      <FeedbackList feedbackRound={closedFeedback} />
      </Tabs.Panel>

    </Tabs>
      </Container>
    </AppLayout>
  );
}

function FeedbackList ({feedbackRound}: {feedbackRound: FeedbackRound[]}) { 
  const { classes } = useStyles();
  const { classes: generalClasses } = useGeneralStyles(); 

  return (<SimpleGrid cols={1}>
    {feedbackRound.map((feedback) => (<Link 
    className={generalClasses.listLinkItem}
    href={`/app/space/${feedback.spaceId}/feedback/${feedback.id}`} key={feedback.id}><Card>
    <Group position="apart">
            <Text fz="lg" fw={500}>
              {feedback.title}
            </Text>
            <FeedbackRoundStatusBadge state={feedback.state} />
          </Group>
    <div>

          <Text fz="sm" fw={300}>
            Created  <Text fz="sm" fw={500} className={classes.inlineText}>{DateTime.fromJSDate(feedback.createdAt)
              .setLocale("en")
              .toRelative()}</Text>
          </Text>

          {feedback.updatedAt && feedback.updatedAt.getTime() !== feedback.createdAt.getTime() && <Text fz="sm" fw={300}>
            Last updated  <Text fz="sm" fw={500} className={classes.inlineText}>{DateTime.fromJSDate(feedback.updatedAt)
              .setLocale("en")
              .toRelative()}</Text>
          </Text>}

        </div>

    </Card></Link>))}
</SimpleGrid>)
}

const LoadingSpaceView: NextPage = () => {
  const router = useRouter()
  
  const { spaceId } = router.query;
  if(!spaceId) return (<div>loading...</div>);

  
  return (
    <SpaceView spaceId={spaceId as string} />
  );
};

export default LoadingSpaceView;
