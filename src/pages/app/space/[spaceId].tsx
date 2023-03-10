import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../components/AppLayout";
import { Container, Title } from "@mantine/core";
import { api } from "../../../utils/api";
import { SpaceNavBar } from '../../../components/SpaceNavBar';
import { SpaceFeed } from '../../../components/SpaceFeed';

function SpaceView({spaceId}: {spaceId: string}) {
  const data = api.space.getSpace.useQuery({spaceId}).data;
  if(!data || !data.space) return (<div>loading...</div>)
  const {space, isMember} = data;

  return (
    <AppLayout>
      <Container size="xs">
      <SpaceNavBar space={space} isMember={isMember}/>
        <Title order={2}>Feed goes here</Title>
        <SpaceFeed spaceId={space.id} />

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
