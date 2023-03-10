import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import { Container, Text, Title } from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from '../../../../../components/SpaceNavBar';
import { SpaceFeed } from '../../../../../components/SpaceFeed';

function ContentView({spaceId, itemId}: {spaceId: string, itemId: string}) {
  const data = api.space.getSpace.useQuery({spaceId}).data;
  const contentResult = api.calendarEvents.getCalendarEvent.useQuery({itemId});
  if(!data || !data.space) return (<div>loading...</div>)
  const {space, isMember} = data;

  return (
    <AppLayout>
      <Container size="xs">
      <SpaceNavBar space={space} isMember={isMember}/>
        
        {contentResult.isLoading &&
            <div>Loading...</div>
        }

{!contentResult.isLoading && !contentResult.data && <div>Content not found</div> }

        {contentResult.data &&
            
            <>
                <Title order={2}>{contentResult.data.title}</Title>
            <Text fz="lg" fw={500}>
                {contentResult.data.startAt.toISOString()}
            </Text>
            <Text fz="lg" fw={500}>
            {contentResult.data.endAt.toISOString()}
            </Text>
            <Text>
            <div dangerouslySetInnerHTML={{__html: contentResult.data.body}} />
        </Text></>
            
        }
      </Container>
    </AppLayout>
  );
} 
const LoadingSpaceView: NextPage = () => {
  const router = useRouter()
  
  const { spaceId, itemId } = router.query;
  if(!spaceId || !itemId) return (<div>loading...</div>);

  return (
    <ContentView spaceId={spaceId as string} itemId={itemId as string} />
  );
};

export default LoadingSpaceView;
