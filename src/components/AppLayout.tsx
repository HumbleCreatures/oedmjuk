import { useState } from "react";
import { NavbarSearch } from "../components/NavBar";
import { AppShell, createStyles, Header, Navbar,MediaQuery, Aside,
  Burger,useMantineTheme, Text } from "@mantine/core";
import logo from "../../public/oedmjuk_logo.svg";
import Image from "next/image";

const useStyles = createStyles((theme) => ({
    main: {
      minHeight: '100vh',
      background: theme.fn.linearGradient(180, theme.colors.earth[6], theme.colors.earth[9]),
    },
    header: {
      background: 'none',
      border: 'none',
      color: theme.colors.gray[0],
      fontWeight: 700,
      [theme.fn.largerThan("sm")]: {
        marginLeft: theme.spacing.sm,
        backgroundColor: 'transparent',
      },
      marginTop: 0,
      fontSize: theme.fontSizes.lg,
      backgroundColor: theme.colors.earth[9],
      paddingTop: 7,
      paddingLeft: theme.spacing.sm,
    },
    navbar: {
      background: 'none',
      border: 'none',
    },
    nameLogo: {
      display: 'inline-block',
    },
    logoWrapper: {
      backgroundColor: theme.colors.earth[9],
      padding: '0.35rem',
      borderRadius: theme.radius.md,
      display: 'inline-block',
      marginRight: theme.spacing.sm,
      
    },
    greenSpan: {
      color: theme.colors.earth[9],
      fontWeight: 800,
      display: 'inline-block',
      fontSize: '2.5rem',
      verticalAlign: 'middle',
      lineHeight: 1,
      paddingBottom: '0.5rem',
    },
}));
export default function AppLayout({
    children
  }: {
    children: React.ReactNode,
  }) {
    const theme = useMantineTheme();
    const [opened, setOpened] = useState(false);

    const {classes} = useStyles();
    return (
      <main className={classes.main}>
        <AppShell
        padding="md"
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        navbar={<Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 200, lg: 300 }} className={classes.navbar}><NavbarSearch /></Navbar>}
        header={<Header  height={{ base: 70, md: 70 }} className={classes.header}>
           <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.white}
                mr="xl"
              />
            </MediaQuery>
            <div className={classes.logoWrapper}><Image
      priority
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      src={logo}
      alt="Oedmjuk"
      height={30}
    /></div><div className={classes.greenSpan}>OEDMJUK</div>
    </Header>}
        styles={(theme) => ({
          main: {  },
        })}
      >
       {children}
      </AppShell></main>
    );
  }



