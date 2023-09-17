import {
  createStyles,
  Group,
  Container,
  rem,
  Title,
  Button,
  Menu,
  SimpleGrid,
  Flex
} from "@mantine/core";
import { Space } from "@prisma/client";
import Link from "next/link";
import { api } from "../utils/api";
import { IconAlignBoxLeftMiddle, IconCalendarEvent, IconChartBar, IconColorSwatch, IconLockAccess, IconMessageCircle, IconNotebook, IconPhoto, IconPlus, IconRecycle, IconSettings, IconTrash } from "@tabler/icons";
import { useRouter } from "next/router";

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.colors.earth[9],
    borderBottom: 0,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,

  },

  inner: {
    height: rem(56),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },


  burger: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },
  spaceTitle: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.earth[1],
    marginBottom: theme.spacing.xl,
  },

  listOfCapabilities: {
    width: "100%",
    [theme.fn.largerThan("sm")]: {
      maxWidth: 300,
    },
  },

  link: {
    display: "block",
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color: theme.white,
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    "&:hover": {
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: "filled", color: theme.primaryColor })
          .background!,
        0.1
      ),
    },
  },

  linkLabel: {
    marginRight: rem(5),
  },

  topRow: {
    width: "100%",
  },
  topGroup: {
    alignItems: "flex-start",
  }

  
}));

export function SpaceNavBar({ space, isMember }: { space: Space, isMember: boolean }) {
  const { classes } = useStyles();

  const joinMutation = api.space.joinSpace.useMutation({
    onSuccess(_data) {
      void utils.space.getAllSpaces.invalidate();
      void utils.space.getMySpaces.invalidate();
      void utils.space.getSpace.invalidate();
    },
  });

  const leaveMutation = api.space.leaveSpace.useMutation({
    onSuccess(_data) {
      void utils.space.getAllSpaces.invalidate();
      void utils.space.getMySpaces.invalidate();
      void utils.space.getSpace.invalidate();
    },
  });

  const utils = api.useContext();

  return (
    <Container className={classes.header}>

      <Group position="apart" className={classes.topGroup}>
      <div>
          <Title order={1} className={classes.spaceTitle}>Space {space.name}</Title>
          <Group>
          {isMember  && <CreationMenu spaceId={space.id} /> }
          {!isMember  && <ExternalCreationMenu spaceId={space.id} /> }
        {isMember &&
            <Button size="xs" onClick={() => { leaveMutation.mutate({spaceId: space.id}) }} >
            Leave space
            </Button>
        }
        </Group>
        </div>

        <div>
        <Group spacing={2} className={classes.listOfCapabilities}>

<Link href={`/app/space/${space.id}/`} className={classes.link}>
  Feed
  </Link>
  <Link href={`/app/space/${space.id}/members`} className={classes.link}>
  Members
  </Link>
  <Link href={`/app/space/${space.id}/settings/requestAccessTypes`} className={classes.link}>
  Settings
  </Link>
  


  <Link href={`/app/space/${space.id}/calendar`} className={classes.link}>
  Calendar
  </Link>
  <Link href={`/app/space/${space.id}/content`} className={classes.link}>
  Content
  </Link>
  <Link href={`/app/space/${space.id}/dataIndices`} className={classes.link}>
  Data
  </Link>
  <Link href={`/app/space/${space.id}/accessRequests`} className={classes.link}>
  Requests
  </Link>

  <Link href={`/app/space/${space.id}/proposals`} className={classes.link}>
  Proposals
  </Link>
  <Link href={`/app/space/${space.id}/selections`} className={classes.link}>
  Selections
  </Link>
  <Link href={`/app/space/${space.id}/feedback`} className={classes.link}>
  Feedback
  </Link>



</Group>
        </div>

      </Group>



    </Container>
  );
}

function CreationMenu({ spaceId }: { spaceId: string}) {
  const router = useRouter();

  return <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button size="xs" leftIcon={<IconPlus />}>Create</Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Create</Menu.Label>
        <Menu.Item icon={<IconAlignBoxLeftMiddle size={14} />} onClick={() => void router.push(`/app/space/${spaceId}/content/create`)}>Create content</Menu.Item>
        <Menu.Item icon={<IconCalendarEvent size={14} />} onClick={() => void router.push(`/app/space/${spaceId}/calendarEvent/create`)}>Create calendar event</Menu.Item>
        <Menu.Item icon={<IconNotebook size={14} />} onClick={() => void router.push(`/app/space/${spaceId}/proposal/create`)}>Create proposal</Menu.Item>
        <Menu.Item icon={<IconColorSwatch size={14} />} onClick={() => void router.push(`/app/space/${spaceId}/selection/create`)}>Create selection</Menu.Item>
        <Menu.Item icon={<IconRecycle size={14} />} onClick={() => void router.push(`/app/space/${spaceId}/feedback/create`)}>Create feedback round</Menu.Item>
        <Menu.Item icon={<IconChartBar size={14} />} onClick={() => void router.push(`/app/space/${spaceId}/dataIndex/create`)}>Create data index</Menu.Item>
        <Menu.Item icon={<IconLockAccess size={14} />} onClick={() => void router.push(`/app/space/${spaceId}/accessRequest/create`)}>Create access request</Menu.Item>

      </Menu.Dropdown>
    </Menu>
}

function ExternalCreationMenu({ spaceId }: { spaceId: string}) {
  const router = useRouter();

  return <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button size="xs" leftIcon={<IconPlus />}>Create</Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Create</Menu.Label>
        <Menu.Item icon={<IconNotebook size={14} />} onClick={() => void router.push(`/app/space/${spaceId}/proposal/create`)}>Create proposal</Menu.Item>
        <Menu.Item icon={<IconLockAccess size={14} />} onClick={() => void router.push(`/app/space/${spaceId}/accessRequest/create`)}>Create access request</Menu.Item>
      </Menu.Dropdown>
    </Menu>
}