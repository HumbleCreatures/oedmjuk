import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../components/AppLayout";
import { Container, Title } from "@mantine/core";
import { api } from "../../../utils/api";
import { UserButtonWithData } from '../../../components/UserButton';

function SpaceView({spaceId}: {spaceId: string}) {
  const space = api.space.getSpace.useQuery({spaceId}).data;
  if(!space) return (<div>loading...</div>)
  const spaceMembers = space.spaceMembers && space.spaceMembers.map((member) => (<div key={member.id}>
    <UserButtonWithData userId={member.userId} />
    </div>));
  return (
    <AppLayout>
      <Container size="xs">
        <Title order={1}>Space {space.name}</Title>
        {spaceMembers}

      </Container>
    </AppLayout>
  );
} 
const CreateSpace: NextPage = () => {
  const router = useRouter()
  
  const { spaceId } = router.query;
  if(!spaceId) return (<div>loading...</div>);

  
  return (
    <SpaceView spaceId={spaceId as string} />
  );
};

export default CreateSpace;
