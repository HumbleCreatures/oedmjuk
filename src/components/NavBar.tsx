import {
  createStyles,
  Navbar,
  TextInput,
  Code,
  UnstyledButton,
  Badge,
  Text,
  Group,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconBulb,
  IconUser,
  IconCheckbox,
  IconSearch,
  IconPlus,
  IconSelector,
} from "@tabler/icons";
import Link from "next/link";
import { NavbarSpaceList } from "./NavBarSpaceList";
import { UserButton } from "./UserButton";

const useStyles = createStyles((theme) => ({
  navbar: {
    paddingTop: 0,
    background: 'none',
    border: 'none'
  },

  section: {
    marginLeft: -theme.spacing.md,
    marginRight: -theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.earth[1],
    borderRadius : theme.radius.md,
    padding: theme.spacing.md,
  },

  sectionSpaces: {
    marginLeft: -theme.spacing.md,
    marginRight: -theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexGrow: 1,
    flex: "none",
  },

  searchCode: {
    fontWeight: 700,
    fontSize: 10,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.colors.gray[0],
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[2]
    }`,
  },

  mainLinks: {
    paddingLeft: theme.spacing.md - theme.spacing.xs,
    paddingRight: theme.spacing.md - theme.spacing.xs,
    paddingBottom: theme.spacing.md,
  },

  mainLink: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    fontSize: theme.fontSizes.xs,
    padding: `8px ${theme.spacing.xs}px`,
    borderRadius: theme.radius.sm,
    fontWeight: 500,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
    },
  },

  mainLinkInner: {
    display: "flex",
    alignItems: "center",
    flex: 1,
  },

  mainLinkIcon: {
    marginRight: theme.spacing.sm,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[2]
        : theme.colors.gray[6],
  },

  mainLinkBadge: {
    padding: 0,
    width: 20,
    height: 20,
    pointerEvents: "none",
  },

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

  footer: {
    marginLeft: -theme.spacing.md,
    marginRight: -theme.spacing.md,
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
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
}));

const links = [
  { icon: IconBulb, label: "Activity", notifications: 3, href: "/app/settings/dataIndexTypes" },
  { icon: IconCheckbox, label: "Tasks", notifications: 4, href: "/app/settings/dataIndexTypes" },
  { icon: IconUser, label: "Data Index Types", href: "/app/settings/dataIndexTypes" },
];

const collections = [
  { emoji: "🍱", label: "Space 1" },
  { emoji: "🍱", label: "Space 2" },
  { emoji: "🍱", label: "Space 3" },
  { emoji: "🍱", label: "Space 4" },
];

export function NavbarSearch() {
  const { classes } = useStyles();

  const mainLinks = links.map((link) => (
    <UnstyledButton key={link.label} className={classes.mainLink}>
      <Link href={link.href} className={classes.mainLinkInner}>
        <link.icon size={20} className={classes.mainLinkIcon} stroke={1.5} />
        <span>{link.label}</span>
      </Link>
      {link.notifications && (
        <Badge size="sm" variant="filled" className={classes.mainLinkBadge}>
          {link.notifications}
        </Badge>
      )}
    </UnstyledButton>
  ));

  return (
    <Navbar width={{ sm: 300 }} p="md" className={classes.navbar}>

      <Navbar.Section className={classes.section}>
        <div className={classes.mainLinks}>{mainLinks}</div>
      </Navbar.Section>

      <Navbar.Section className={classes.section}>
      <NavbarSpaceList />
      </Navbar.Section>
    </Navbar>
  );
}
