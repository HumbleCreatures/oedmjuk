import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../../components/AppLayout";
import { Container, Title, SimpleGrid, createStyles, Card, Text } from "@mantine/core";
import { api } from "../../../../utils/api";
import { SpaceNavBar } from '../../../../components/SpaceNavBar';
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { DateTime } from "luxon";
import Link from 'next/link';



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
  }
}));

function SpaceView({spaceId}: {spaceId: string}) {
  const { classes } = useStyles();
  

  const spaceRequest = api.space.getSpace.useQuery({spaceId});
  const feedbackRequest = api.feedback.getFeedbackRoundsForSpace.useQuery({spaceId});
  if(spaceRequest.isLoading || feedbackRequest.isLoading) return (<div>loading...</div>);
  if(spaceRequest.error || feedbackRequest.error) return (<div>error</div>);
  if(spaceRequest.data === undefined || feedbackRequest.data === undefined) return (<div>not found</div>);
  const {space, isMember} = spaceRequest.data;

  return (
    <AppLayout>
      <Container size="sm">
      <SpaceNavBar space={space} isMember={isMember}/>
      <div className={classes.area}>
        <Title order={2} className={classes.areaTitle}>Feedback</Title>
        <SimpleGrid cols={1}>
            {feedbackRequest.data.map((feedbackRound) => (<Link href={`/app/space/${feedbackRound.spaceId}/feedback/${feedbackRound.id}`} key={feedbackRound.id}><Card>
            <Text fz="lg" fw={500}>{feedbackRound.title}</Text>
            <div>
                <Text fz="sm" fw={300}>
                    State:  <Text fz="sm" fw={500} className={classes.inlineText}>{feedbackRound.state}</Text>
                  </Text>
                  <Text fz="sm" fw={300}>
                    Created  <Text fz="sm" fw={500} className={classes.inlineText}>{DateTime.fromJSDate(feedbackRound.createdAt)
                      .setLocale("en")
                      .toRelative()}</Text>
                  </Text>

                  {feedbackRound.updatedAt && feedbackRound.updatedAt.getTime() !== feedbackRound.createdAt.getTime() && <Text fz="sm" fw={300}>
                    Last updated  <Text fz="sm" fw={500} className={classes.inlineText}>{DateTime.fromJSDate(feedbackRound.updatedAt)
                      .setLocale("en")
                      .toRelative()}</Text>
                  </Text>}

                </div>

            </Card></Link>))}
        </SimpleGrid>


      </div>
      </Container>
    </AppLayout>
  );
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
