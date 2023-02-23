import { NavbarSearch } from "../components/NavBar";
import { AppShell, Header, Navbar } from "@mantine/core";

export default function AppLayout({
    children
  }: {
    children: React.ReactNode,
  }) {
    return (
        <AppShell
        padding="md"
        navbar={<Navbar width={{ base: 300 }} height={500} p="xs"><NavbarSearch /></Navbar>}
        header={<Header height={20} p="xs">{/* Header content */}</Header>}
        styles={(theme) => ({
          main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
        })}
      >
       {children}
      </AppShell>
    );
  }



