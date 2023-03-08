import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../components/AppLayout";
import { Container, Title } from "@mantine/core";
import { api } from "../../../utils/api";

function UserView({userId}: {userId: string}) {
  const user = api.space.getUser.useQuery({userId}).data;
  if(!user) return (<div>loading...</div>)

  return (
    <AppLayout>
      <Container size="xs">
        <Title order={1}>User: {user.name}</Title>
      </Container>
    </AppLayout>
  );
} 
const CreateSpace: NextPage = () => {
  const router = useRouter()
  
  const { userId } = router.query;
  if(!userId) return (<div>loading...</div>);

  
  return (
    <UserView userId={userId as string} />
  );
};

export default CreateSpace;
