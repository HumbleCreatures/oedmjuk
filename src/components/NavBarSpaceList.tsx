import { api } from "../utils/api";
import {
  ActionIcon,
  createStyles,
  Group,
  Navbar,
  Text,
  Tooltip,
} from "@mantine/core";
import Link from "next/link";
import { IconPlus } from "@tabler/icons";

const useStyles = createStyles((theme) => ({
  collections: {
    paddingLeft: theme.spacing.md - 6,
    paddingRight: theme.spacing.md - 6,
    paddingBottom: theme.spacing.md,
  },

  collectionsHeader: {
    paddingLeft: theme.spacing.md + 2,
    paddingRight: theme.spacing.md,
    marginBottom: 5,
  },

  collectionLink: {
    display: "block",
    padding: `8px ${theme.spacing.xs}px`,
    textDecoration: "none",
    borderRadius: theme.radius.sm,
    fontSize: theme.fontSizes.xs,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    lineHeight: 1,
    fontWeight: 500,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
    },
  },
  sectionSpaces: {
    marginLeft: -theme.spacing.md,
    marginRight: -theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexGrow: 1,
    flex: "none",
  },
}));

export function NavbarSpaceList() {
  const { classes } = useStyles();
  const spaces = api.space.getAllSpaces.useQuery().data;
  if (!spaces) return null;
  const spaceLinks = spaces.map((space) => (
    <Link key={space.id} href={`/app/space/${space.id}`}>
      <div className={classes.collectionLink}>
        <span style={{ marginRight: 9, fontSize: 16 }}>🍱</span> {space.name}
      </div>
    </Link>
  ));

  return (
    <Navbar.Section className={classes.sectionSpaces} grow={true}>
      <Group className={classes.collectionsHeader} position="apart">
        <Text size="xs" weight={500} color="dimmed">
          Spaces
        </Text>
        <Tooltip label="Create space" withArrow position="right">
          <Link href="/app/space/create">
            <ActionIcon variant="default" size={18}>
              <IconPlus size={12} stroke={1.5} />
            </ActionIcon>
          </Link>
        </Tooltip>
      </Group>
      <div className={classes.collections}>{spaceLinks}</div>
    </Navbar.Section>
  );
}
