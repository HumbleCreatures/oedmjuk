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
import { IconAlignBoxLeftMiddle, IconArrowsLeftRight, IconCalendar, IconCalendarEvent, IconChartBar, IconColorSwatch, IconMessageCircle, IconNotebook, IconPhoto, IconPlus, IconRecycle, IconSettings, IconTrash } from "@tabler/icons";
import { useRouter } from "next/router";

const useStyles = createStyles((theme) => ({
  header: {
    backgroundColor: theme.colors.earth[9],
    borderBottom: 0,
    borderRadius: theme.radius.md,
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
    fontSize: theme.fontSizes.xl,
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
  }

  
}));


export function SettingsNavBar() {
  const { classes } = useStyles();

  return (
    <Container className={classes.header}>
      <div className={classes.inner}>
      <SimpleGrid cols={2} className={classes.topRow} >
        <div>
          <Title order={1} className={classes.spaceTitle}>Settings</Title>
        </div>


      </SimpleGrid>
      </div>
      
       

      <div className={classes.inner}>
        <Group spacing={5} className={classes.links}>

          <Link href={`/app/settings/dataIndexType`} className={classes.link}>
            Data Index Types
            </Link>

            <Link href={`/app/settings/templates`} className={classes.link}>
            Templates
            </Link>   

            <Link href={`/app/settings`} className={classes.link}>
            General
            </Link>         

        </Group>
      </div>
    </Container>
  );
}
