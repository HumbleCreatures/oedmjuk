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
  const contentRequest = api.content.getAllContentForSpace.useQuery({spaceId});
  if(spaceRequest.isLoading || contentRequest.isLoading) return (<div>loading...</div>);
  if(spaceRequest.error || contentRequest.error) return (<div>error</div>);
  if(spaceRequest.data === undefined || contentRequest.data === undefined) return (<div>not found</div>);
  const {space, isMember} = spaceRequest.data;

  return (
    <AppLayout>
      <Container size="sm">
      <SpaceNavBar space={space} isMember={isMember}/>
      <div className={classes.area}>
        <Title order={2} className={classes.areaTitle}>Content pages</Title>
        <SimpleGrid cols={1}>
            {contentRequest.data.map((content) => (<Link href={`/app/space/${content.spaceId}/content/${content.id}`} key={content.id}><Card>
            <Text fz="lg" fw={500}>{content.title}</Text>
            <div>
                  
                  <Text fz="sm" fw={300}>
                    Created  <Text fz="sm" fw={500} className={classes.inlineText}>{DateTime.fromJSDate(content.createdAt)
                      .setLocale("en")
                      .toRelative()}</Text>
                  </Text>

                  {content.updatedAt && content.updatedAt.getTime() !== content.createdAt.getTime() && <Text fz="sm" fw={300}>
                    Last updated  <Text fz="sm" fw={500} className={classes.inlineText}>{DateTime.fromJSDate(content.updatedAt)
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
