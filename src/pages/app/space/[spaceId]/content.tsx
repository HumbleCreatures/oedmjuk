import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../../components/AppLayout";
import { Container, Title, SimpleGrid, createStyles, Card, Text, Group, ThemeIcon } from "@mantine/core";
import { api } from "../../../../utils/api";
import { SpaceNavBar } from '../../../../components/SpaceNavBar';
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { DateTime } from "luxon";
import Link from 'next/link';
import { SpaceLoader } from '../../../../components/Loaders/SpaceLoader';
import { IconAlignBoxLeftMiddle } from '@tabler/icons';


const useStyles = createStyles((theme) => ({
  area: {
    backgroundColor: theme.colors.gray[4],
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.md,
  },
  listHeader: {
    borderBottom: `2px solid ${theme.colors.earth[2]}`,
    marginTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  inlineText: {
    display: "inline",
  },
  clearArea: {
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
    color: theme.white,
    padding: 0
  },
  listLinkItem: {
    borderRadius: theme.radius.md,
    boxShadow: theme.shadows.sm,
    backgroundColor: theme.white,
    paddingLeft: theme.spacing.md,
    color: theme.black,
    '&:hover': { 
      borderLeft: `0.5rem solid ${theme.colors.earth[2]}`,
      paddingLeft: '0.5rem', 
    }
  }
}));

function SpaceContentView({spaceId}: {spaceId: string}) {
  const { classes } = useStyles();
  const spaceResult = api.space.getSpace.useQuery({ spaceId });
  const contentResult = api.content.getAllContentForSpace.useQuery({spaceId});
  
  if (spaceResult.isLoading) return <SpaceLoader />;
  if (!spaceResult.data)
    return <div>Could not find space</div>;
  const { space, isMember } = spaceResult.data;
  if (contentResult.isLoading) return <SpaceLoader space={space} isMember={isMember} />;
  if (!contentResult.data)
    return <div>Could not find content pages</div>;

  return (
    <AppLayout>
      <Container size="sm">
      <SpaceNavBar space={space} isMember={isMember}/>
      <Container size="sm" className={classes.clearArea}>
        <Group className={classes.listHeader}>
        
                  <IconAlignBoxLeftMiddle />
        <Title order={2} className={classes.title}>Content pages</Title>
        </Group>
        <SimpleGrid cols={1}>
            {contentResult.data.map((content) => (<Link className={classes.listLinkItem} href={`/app/space/${content.spaceId}/content/${content.id}`} key={content.id}><Card>
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
    <SpaceContentView spaceId={spaceId as string} />
  );
};

export default LoadingSpaceView;
