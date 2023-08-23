import { useRouter } from "next/router";
import { type NextPage } from "next";
import AppLayout from "../../../../components/AppLayout";
import {
  Container,
  Title,
  SimpleGrid,
  createStyles,
  Card,
  Text,
  Group,
  Tabs,
  Badge,
} from "@mantine/core";
import { api } from "../../../../utils/api";
import { SpaceNavBar } from "../../../../components/SpaceNavBar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { DateTime } from "luxon";
import Link from "next/link";
import { IconLockAccess, IconNotebook } from "@tabler/icons";
import { useGeneralStyles } from "../../../../styles/generalStyles";
import { AccessRequest, AccessRequestType, Proposal } from "@prisma/client";
import { ProposalStates, AccessRequestStates } from "../../../../utils/enums";
import { ProposalStatusBadge } from "../../../../components/ProposalStatusBadge";
import { SpaceLoader } from "../../../../components/Loaders/SpaceLoader";
import { AccessRequestStatusBadge } from "../../../../components/AccessRequestStatusBadge";

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
  title: {
    fontSize: theme.fontSizes.md,
  },
  titleWrapper: {
    marginBottom: theme.spacing.md,
  },
  idText: {
    display: "inline",
    color: theme.colors.earth[5],
  },
}));

function SpaceView({ spaceId }: { spaceId: string }) {
  const { classes } = useStyles();
  const { classes: generalClasses } = useGeneralStyles();

  const spaceResult = api.space.getSpace.useQuery({ spaceId });
  const accessRequestResult = api.accessRequest.getAllAccessRequestsForSpace.useQuery({ spaceId });
  if (spaceResult.isLoading) return <SpaceLoader />;
  if (!spaceResult.data)
    return <div>Could not find space</div>;
  const { space, isMember } = spaceResult.data;
  if (accessRequestResult.isLoading) return <SpaceLoader space={space} isMember={isMember} />;
  if (!accessRequestResult.data)
    return <div>Could not find content pages</div>;

  const createdAccessRequests = accessRequestResult.data.filter(p => p.state === AccessRequestStates.Created);
  const acceptedAccessRequests = accessRequestResult.data.filter(p => p.state === AccessRequestStates.Approved);
  const finishedAccessRequests = accessRequestResult.data.filter(p => p.state === AccessRequestStates.Finished);
  const deniedAccessRequests = accessRequestResult.data.filter(p => p.state === AccessRequestStates.Denied);

  return (
    <AppLayout>
      <Container size="sm"> 
        <SpaceNavBar space={space} isMember={isMember} />
        <Container size="sm" className={generalClasses.clearArea}>
          <Group className={classes.titleWrapper}>
            <IconLockAccess />
            <Title order={2} className={classes.title}>
              Access Request
            </Title>
          </Group>
          <Tabs defaultValue="created" 
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
              {createdAccessRequests.length}
            </Badge>
          }
          value="created"
        >
          Created
        </Tabs.Tab>
        <Tabs.Tab value="accepted"
        rightSection={
          <Badge
            w={16}
            h={16}
            sx={{ pointerEvents: 'none' }}
            size="xs"
            p={0}
            
          >
            {acceptedAccessRequests.length}
          </Badge>
        }>Accepted</Tabs.Tab>
        <Tabs.Tab value="finished"
        rightSection={
          <Badge
            w={16}
            h={16}
            sx={{ pointerEvents: 'none' }}
            size="xs"
            p={0}
            
          >
            {finishedAccessRequests.length}
          </Badge>
        }>Finished</Tabs.Tab>
        <Tabs.Tab value="declined"
        rightSection={
          <Badge
            w={16}
            h={16}
            sx={{ pointerEvents: 'none' }}
            size="xs"
            p={0}
            
          >
            {deniedAccessRequests.length}
          </Badge>
        }>Declined</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="created">
       <AccessRequestList accessRequests={createdAccessRequests} />
      </Tabs.Panel>
      <Tabs.Panel value="accepted">
      <AccessRequestList accessRequests={acceptedAccessRequests} />
      </Tabs.Panel>
      <Tabs.Panel value="finished">
      <AccessRequestList accessRequests={finishedAccessRequests} />
      </Tabs.Panel>
      <Tabs.Panel value="denied">
      <AccessRequestList accessRequests={deniedAccessRequests} />
      </Tabs.Panel>
    </Tabs>


        </Container>
      </Container>
    </AppLayout>
  );
}
type AccessRequestWithType = AccessRequest & {
    accessRequestType: AccessRequestType
}
function AccessRequestList ({accessRequests}: {accessRequests: AccessRequestWithType[] }) {
  const { classes } = useStyles();
  const { classes: generalClasses } = useGeneralStyles(); 
  return (<SimpleGrid cols={1}>
    {accessRequests.map((accessRequest) => (
      <Link
        href={`/app/space/${accessRequest.spaceId}/accessRequest/${accessRequest.id}`}
        key={accessRequest.id}
        className={generalClasses.listLinkItem}
      >
        <Card>
          <Group position="apart">
            <div>
            <Text fz="lg" fw={500}>
              {accessRequest.accessRequestType.name}
            </Text>
            <Text fz="sm" fw={500} className={classes.idText}>
              Id: {accessRequest.id}
            </Text></div>
            <AccessRequestStatusBadge state={accessRequest.state} />
          </Group>
          
          <div>


            <Text fz="sm" fw={300}>
              Created{" "}
              <Text fz="sm" fw={500} className={classes.inlineText}>
                {DateTime.fromJSDate(accessRequest.createdAt)
                  .setLocale("en")
                  .toRelative()}
              </Text>
            </Text>

            {accessRequest.updatedAt &&
              accessRequest.updatedAt.getTime() !==
                accessRequest.createdAt.getTime() && (
                <Text fz="sm" fw={300}>
                  Last updated{" "}
                  <Text fz="sm" fw={500} className={classes.inlineText}>
                    {DateTime.fromJSDate(accessRequest.updatedAt)
                      .setLocale("en")
                      .toRelative()}
                  </Text>
                </Text>
              )}
          </div>
        </Card>
      </Link>
    ))}
  </SimpleGrid>)
}
const LoadingSpaceView: NextPage = () => {
  const router = useRouter();

  const { spaceId } = router.query;
  if (!spaceId) return <div>loading...</div>;

  return <SpaceView spaceId={spaceId as string} />;
};

export default LoadingSpaceView;
