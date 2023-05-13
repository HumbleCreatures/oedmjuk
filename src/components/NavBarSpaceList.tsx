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
import { IconPlus, IconBox } from "@tabler/icons";

const useStyles = createStyles((theme) => ({

  collections: {
    padding: 0,
  },

  collectionsHeader: {
    paddingLeft: theme.spacing.sm,
    paddingRight: 0,
    marginBottom: 5,
  },

  collectionLink: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    fontSize: theme.fontSizes.sm,
    padding: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    fontWeight: 500,
    color: theme.colors.earth[9],

    "&:hover": {
      backgroundColor: theme.colors.gray[0],
    },
  },
  mainLinkIcon: {
    marginRight: theme.spacing.sm,
    color: theme.colors.earth[9],
  },
  sectionSpaces: {
    marginLeft: -theme.spacing.md,
    marginRight: -theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexGrow: 1,
    flex: "none",
  },
  addButtonIcon: {
    color: theme.colors.earth[9],
  }
}));

export function NavbarSpaceList() {
  const { classes } = useStyles();
  const spaceResult = api.space.getAllSpaces.useQuery();

  if(spaceResult.isLoading) {
    return <div>...Loading</div>
  }

  const spaceLinks = spaceResult.data && spaceResult.data.map((space) => (
    <Link key={space.id} href={`/app/space/${space.id}`}>
      <div className={classes.collectionLink}>
        <IconBox size={20} className={classes.mainLinkIcon} stroke={1.5} /> {space.name}
      </div>
    </Link>
  ));

  return (
    <Navbar.Section className={classes.sectionSpaces} grow={true}>
      <Group className={classes.collectionsHeader} position="apart">
        <Text size="md" weight={500}>
          Spaces
        </Text>
        <Tooltip label="Find or create spaces" withArrow position="right">
          <Link href="/app/space/create">
            <ActionIcon size={22}>
              <IconPlus size={18} className={classes.addButtonIcon}/>
            </ActionIcon>
          </Link>
        </Tooltip>
      </Group>
      <div className={classes.collections}>{spaceLinks}</div>
    </Navbar.Section>
  );
}
