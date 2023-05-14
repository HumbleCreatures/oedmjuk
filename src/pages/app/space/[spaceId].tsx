import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../components/AppLayout";
import { Container, Title, SimpleGrid, createStyles } from "@mantine/core";
import { api } from "../../../utils/api";
import { SpaceNavBar } from '../../../components/SpaceNavBar';
import { SpaceFeed } from '../../../components/SpaceFeed';

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
  }
}));

function SpaceView({spaceId}: {spaceId: string}) {
  const { classes } = useStyles();

  const data = api.space.getSpace.useQuery({spaceId}).data;
  if(!data || !data.space) return (<div>loading...</div>)
  const {space, isMember} = data;

  return (
    <AppLayout>
      <Container size="sm">
      <SpaceNavBar space={space} isMember={isMember}/>
      <div className={classes.area}>
        <Title order={2} className={classes.areaTitle}>Feed</Title>
        <SimpleGrid cols={1}>
        <SpaceFeed spaceId={space.id} />
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
