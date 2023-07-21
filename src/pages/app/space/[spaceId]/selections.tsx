import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../../components/AppLayout";
import { Container, Title, SimpleGrid, createStyles, Card, Text, Group, Badge, Tabs } from "@mantine/core";
import { api } from "../../../../utils/api";
import { SpaceNavBar } from '../../../../components/SpaceNavBar';
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { DateTime } from "luxon";
import Link from 'next/link';
import { SpaceLoader } from '../../../../components/Loaders/SpaceLoader';
import { IconColorSwatch } from '@tabler/icons';
import { useGeneralStyles } from '../../../../styles/generalStyles';
import { SelectionStates } from '../../../../utils/enums';
import { Selection } from "@prisma/client";
import { SelectionStatusBadge } from '../../../../components/SelectionStatusBadge';

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
  },
  titleWrapper: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.md,
  }
}));

function SpaceView({spaceId}: {spaceId: string}) {
  const { classes } = useStyles();
  const { classes: generalClasses } = useGeneralStyles(); 

  const spaceResult = api.space.getSpace.useQuery({ spaceId });
  const selectionRequest = api.selection.getSelectionsForSpace .useQuery({spaceId});
  
  if (spaceResult.isLoading) return <SpaceLoader />;
  if (!spaceResult.data)
    return <div>Could not find space</div>;
  const { space, isMember } = spaceResult.data;
  if (selectionRequest.isLoading) return <SpaceLoader space={space} isMember={isMember} />;
  if (!selectionRequest.data)
    return <div>Could not find content pages</div>;

  const openSelections = selectionRequest.data.filter((selection) => selection.state === SelectionStates.Created);
  const votingSelections = selectionRequest.data.filter((selection) => selection.state === SelectionStates.BuyingStarted);
  const finishedSelections = selectionRequest.data.filter((selection) => selection.state === SelectionStates.VoteClosed);

  return (
    <AppLayout>
      <Container size="sm">
      <SpaceNavBar space={space} isMember={isMember}/>
      <Container size="sm" className={generalClasses.clearArea}>
          <Group className={classes.titleWrapper}>
          <IconColorSwatch />
            <Title order={2} className={classes.title}>
              Selections
            </Title>
          </Group>
      </Container>
      <Tabs defaultValue="open" 
          styles={(theme) => ({
            tabsList: {
              border: 'none',
            },
            tab: { 
              color: theme.white,
              marginBottom: theme.spacing.xs,
              borderColor: theme.colors.earth[2],
              borderRadius: 0,
              '&[right-section]': {
                backgroundColor: theme.fn.rgba(theme.white, 0.1),
               },
              '&:hover': {
                backgroundColor: theme.fn.rgba(theme.white, 0.05),
                borderColor: theme.colors.earth[2],
              },
              '&[data-active]': {
                backgroundColor: theme.fn.rgba(theme.white, 0.1),
                borderColor: theme.white,
                color: theme.white,
              },
              '&[data-active]:hover': {
                backgroundColor: theme.fn.rgba(theme.white, 0.1),
                borderColor: theme.white,
                color: theme.white,
              },
            }
          })}>
      <Tabs.List grow>
        <Tabs.Tab
          rightSection={
            <Badge
              w={16}
              h={16}
              sx={{ pointerEvents: 'none' }}
              size="xs"
              p={0}
              
            >
              {openSelections.length}
            </Badge>
          }
          value="open"
        >
          Open
        </Tabs.Tab>
        <Tabs.Tab value="voting"
        rightSection={
          <Badge
            w={16}
            h={16}
            sx={{ pointerEvents: 'none' }}
            size="xs"
            p={0}
            
          >
            {votingSelections.length}
          </Badge>
        }>Voting</Tabs.Tab>
        <Tabs.Tab value="finished"
        rightSection={
          <Badge
            w={16}
            h={16}
            sx={{ pointerEvents: 'none' }}
            size="xs"
            p={0}
            
          >
            {finishedSelections.length}
          </Badge>
        }>Finished</Tabs.Tab>

      </Tabs.List>
      <Tabs.Panel value="open">
       <SelectionList selections={openSelections} />
      </Tabs.Panel>
      <Tabs.Panel value="voting">
      <SelectionList selections={votingSelections} />
      </Tabs.Panel>
      <Tabs.Panel value="finished">
      <SelectionList selections={finishedSelections} />
      </Tabs.Panel>

    </Tabs>

      </Container>
    </AppLayout>
  );
}

function SelectionList ({selections}: {selections: Selection[]}) { 
  const { classes } = useStyles();
  const { classes: generalClasses } = useGeneralStyles(); 

  return (<SimpleGrid cols={1}>
    {selections.map((selection) => (<Link 
    className={generalClasses.listLinkItem}
    href={`/app/space/${selection.spaceId}/selection/${selection.id}`} key={selection.id}><Card>
    <Group position="apart">
            <Text fz="lg" fw={500}>
              {selection.title}
            </Text>
            <SelectionStatusBadge state={selection.state} />
          </Group>
    <div>

          <Text fz="sm" fw={300}>
            Created  <Text fz="sm" fw={500} className={classes.inlineText}>{DateTime.fromJSDate(selection.createdAt)
              .setLocale("en")
              .toRelative()}</Text>
          </Text>

          {selection.updatedAt && selection.updatedAt.getTime() !== selection.createdAt.getTime() && <Text fz="sm" fw={300}>
            Last updated  <Text fz="sm" fw={500} className={classes.inlineText}>{DateTime.fromJSDate(selection.updatedAt)
              .setLocale("en")
              .toRelative()}</Text>
          </Text>}

        </div>

    </Card></Link>))}
</SimpleGrid>)
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
