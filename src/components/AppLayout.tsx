import { useState } from "react";
import { NavbarSearch } from "../components/NavBar";
import { AppShell, createStyles, Header, Navbar,MediaQuery, Aside,
  Burger,useMantineTheme, Text } from "@mantine/core";

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
      marginLeft: theme.spacing.sm,
      marginTop: theme.spacing.xs,
      fontSize: theme.fontSizes.lg,
    },
    navbar: {
      background: 'none',
      border: 'none',
    },
    nameLogo: {
      display: 'inline-block',
    }
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
        header={<Header  height={{ base: 50, md: 70 }} p="md" className={classes.header}>
           <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                mr="xl"
              />
            </MediaQuery>
            <Text className={classes.nameLogo}>Oedmjuk</Text></Header>}
        styles={(theme) => ({
          main: {  },
        })}
      >
       {children}
      </AppShell></main>
    );
  }



