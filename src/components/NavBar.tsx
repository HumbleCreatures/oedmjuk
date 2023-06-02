import {
  createStyles,
  Navbar,
  MediaQuery,
  UnstyledButton,

} from "@mantine/core";
import {
  IconCalendar,
  IconSettings,
  IconClipboardList,
} from "@tabler/icons";
import Link from "next/link";
import { NavbarSpaceList } from "./NavBarSpaceList";

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
    backgroundColor: 'rgba(255,255,255,1.0)',
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
    padding: 0,
  },

  mainLink: {
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

  mainLinkInner: {
    display: "flex",
    alignItems: "center",
    flex: 1,
  },

  mainLinkIcon: {
    marginRight: theme.spacing.sm,
    color: theme.colors.earth[9],
  },

  mainLinkBadge: {
    padding: 0,
    width: 20,
    height: 20,
    pointerEvents: "none",
    backgroundColor: theme.colors.earth[0],
    color: theme.colors.earth[9],
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
  { icon: IconClipboardList, label: "My Feed", /*notifications: 3,*/ href: "/app" },
  { icon: IconCalendar, label: "My Calendar", /*notifications: 3,*/ href: "/app/my/calendar" },
  { icon: IconSettings, label: "Settings", href: "/app/settings/dataIndexTypes" },
];

export function NavbarSearch() {
  const { classes } = useStyles();

  const mainLinks = links.map((link) => (
    <UnstyledButton key={link.label} className={classes.mainLink}>
      <Link href={link.href} className={classes.mainLinkInner}>
        <link.icon size={20} className={classes.mainLinkIcon} stroke={1.5} />
        <span>{link.label}</span>
      </Link>
      {/*link.notifications && (
        <Badge size="sm" variant="filled" className={classes.mainLinkBadge}>
          {link.notifications}
        </Badge>
      )*/}
    </UnstyledButton>
  ));

  return (
    <Navbar width={{ sm: 300 }} p="md" className={classes.navbar}>
      <MediaQuery largerThan="sm" styles={{ display: 'rgba(255,255,255,0.4)' }}>

      
      <Navbar.Section className={classes.section}>
        <div className={classes.mainLinks}>{mainLinks}</div>
      </Navbar.Section>
      </MediaQuery>
      <MediaQuery smallerThan="sm" styles={{ display: 'rgba(255,255,255,0.4)' }}>
      <Navbar.Section className={classes.section}>
      <NavbarSpaceList />
      </Navbar.Section>
      </MediaQuery>
    </Navbar>
  );
}
