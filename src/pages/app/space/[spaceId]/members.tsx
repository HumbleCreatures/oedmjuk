import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../../components/AppLayout";
import { Container, Title, createStyles, List, ThemeIcon } from "@mantine/core";
import { api } from "../../../../utils/api";
import { UserButtonWithData, UserLinkWithData } from '../../../../components/UserButton';
import { SpaceNavBar } from '../../../../components/SpaceNavBar';
import { IconUser } from '@tabler/icons';

const useStyles = createStyles((theme) => ({
  area: {
    backgroundColor: theme.white,
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
  const {classes} = useStyles();
  const data = api.space.getSpace.useQuery({spaceId}).data;
  if(!data || !data.space) return (<div>loading...</div>)
  const {space, isMember} = data;
  
  return (
    <AppLayout>
      <Container size="sm">
      <SpaceNavBar space={space} isMember={isMember}/>
      <Container size="sm" className={classes.area}>
        <Title order={2} className={classes.areaTitle}>Members</Title>
        
        <List
            spacing="xs"
            size="sm"
            center
            icon={
              <ThemeIcon color="earth" size={24} radius="xl">
                <IconUser size="1rem" />
              </ThemeIcon>
            }
          >
            {space.spaceMembers.map((member) => (
              <List.Item key={member.id}>
                <UserLinkWithData userId={member.userId} />
              </List.Item>
            ))}
          </List>

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
