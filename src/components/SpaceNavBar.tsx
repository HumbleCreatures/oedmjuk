import {
  createStyles,
  Group,
  Container,
  rem,
  Title,
  Button,
} from "@mantine/core";
import { Space } from "@prisma/client";
import Link from "next/link";
import { api } from "../utils/api";

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.fn.variant({
      variant: "filled",
      color: theme.primaryColor,
    }).background,
    borderBottom: 0,
  },

  inner: {
    height: rem(56),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  links: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  burger: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },
  spaceTitle: {
    color: theme.white,
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
}));

interface HeaderSearchProps {
  links: { link: string; label: string }[];
}

export function SpaceNavBar({ space, isMember }: { space: Space, isMember: boolean }) {
  const { classes } = useStyles();

  const joinMutation = api.space.joinSpace.useMutation({
    onSuccess(_data) {
      void utils.space.getAllSpaces.invalidate();
      void utils.space.getSpace.invalidate();
    },
  });

  const leaveMutation = api.space.leaveSpace.useMutation({
    onSuccess(_data) {
      void utils.space.getAllSpaces.invalidate();
      void utils.space.getSpace.invalidate();
    },
  });

  const utils = api.useContext();

  return (
    <Container className={classes.header}>
      <Title order={1} className={classes.spaceTitle}>Space {space.name}</Title>
      <div className={classes.inner}>
        <Group spacing={5} className={classes.links}>
        {isMember && <Link href={`/app/space/${space.id}/content/create`} className={classes.link}>
            Create content
            </Link> }
            {isMember && <Link href={`/app/space/${space.id}/calendarEvent/create`} className={classes.link}>
            Create calendar event
            </Link> }
            {isMember && <Link href={`/app/space/${space.id}/proposal/create`} className={classes.link}>
            Create proposal
            </Link> }
            <Link href={`/app/space/${space.id}/members`} className={classes.link}>
            Members
            </Link>
            {isMember ?
            <Button onClick={() => { leaveMutation.mutate({spaceId: space.id}) }} className={classes.link}>
            Leave space
            </Button> :
            <Button onClick={() => { joinMutation.mutate({spaceId: space.id}) }} className={classes.link}>
            Join space
            </Button>
        }

        </Group>
      </div>
    </Container>
  );
}
