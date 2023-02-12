import styles from "./index.module.css";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "../utils/api";
import { NavbarSearch } from "../components/NavBar";
import { AppShell, Header, Navbar } from "@mantine/core";

const TheApp: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <AppShell
      padding="md"
      navbar={<Navbar width={{ base: 300 }} height={500} p="xs"><NavbarSearch /></Navbar>}
      header={<Header height={20} p="xs">{/* Header content */}</Header>}
      styles={(theme) => ({
        main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
      })}
    >
     <div>WOOT!</div>
    </AppShell>
  );
};

export default TheApp;
