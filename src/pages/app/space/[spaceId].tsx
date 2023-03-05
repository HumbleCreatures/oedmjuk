import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../components/AppLayout";
import { Container, Title } from "@mantine/core";
import { api } from "../../../utils/api";

const CreateSpace: NextPage = () => {
  const router = useRouter()
  const { spaceId } = router.query;
  const space = api.space.getSpace.useQuery({spaceId:spaceId as string}).data;
  
  if(!space) return (<div>loading...</div>)
  return (
    <AppLayout>
      <Container size="xs">
        <Title order={1}>Space {space.name}</Title>
      </Container>
    </AppLayout>
  );
};

export default CreateSpace;
