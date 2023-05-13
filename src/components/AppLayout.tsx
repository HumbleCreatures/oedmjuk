import { NavbarSearch } from "../components/NavBar";
import { AppShell, createStyles, Header, Navbar } from "@mantine/core";

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
    }
}));
export default function AppLayout({
    children
  }: {
    children: React.ReactNode,
  }) {

    const styles = useStyles();
    return (
      <main className={styles.classes.main}>
        <AppShell
        padding="md"
        navbar={<Navbar width={{ base: 300 }} height={500} p="xs" className={styles.classes.navbar}><NavbarSearch /></Navbar>}
        header={<Header height={42} p="xs" className={styles.classes.header}>Oedmjuk</Header>}
        styles={(theme) => ({
          main: {  },
        })}
      >
       {children}
      </AppShell></main>
    );
  }



