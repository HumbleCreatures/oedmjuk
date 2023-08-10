import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../components/AppLayout";
import { Container, Title, SimpleGrid, createStyles, Group } from "@mantine/core";
import { api } from "../../../utils/api";
import { SpaceNavBar } from '../../../components/SpaceNavBar';
import { SpaceFeed } from '../../../components/SpaceFeed';
import { IconBox } from '@tabler/icons';
import { useGeneralStyles } from '../../../styles/generalStyles';
import { SpaceLoader } from '../../../components/Loaders/SpaceLoader';

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
  title: {
    fontSize: theme.fontSizes.md,
  },
}));

function SpaceView({spaceId}: {spaceId: string}) {
  const { classes } = useStyles();
  const { classes: generalClasses } = useGeneralStyles();

  const spaceResult = api.space.getSpace.useQuery({ spaceId });
  if (spaceResult.isLoading) return <SpaceLoader />;
  if (!spaceResult.data) return <div>Could not load space</div>;
  const { space, isMember } = spaceResult.data;


  return (
    <AppLayout>
      <Container size="sm">
      <SpaceNavBar space={space} isMember={isMember}/>
      <Container size="sm" className={generalClasses.clearArea}>
        <Group className={generalClasses.listHeader}>
        
        <IconBox />
        <Title order={2} className={classes.title}>Space feed</Title>
        </Group>
        <SimpleGrid cols={1}>
        <SpaceFeed spaceId={space.id} />
        </SimpleGrid>
        </Container>
      
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
