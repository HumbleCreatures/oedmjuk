import { type NextPage } from "next";
import AppLayout from "../AppLayout";
import { Container, createStyles, Loader } from "@mantine/core";
import { SettingsNavBar } from "../SettingsNavBar";
import { SpaceNavBar } from "../SpaceNavBar";
import { Space } from "@prisma/client";

const useStyles = createStyles((theme) => ({
  loaderArea: {
    backgroundColor: theme.white,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    height: 200
  },
  loaderPosition: { 
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 70,
    display: 'block'
  }
 
}));

export function CleanLoader() {
  const { classes } = useStyles();

  return (
    <AppLayout>
      <Container size="sm">
      <Container size="sm" className={classes.loaderArea}>
        <Loader className={classes.loaderPosition} />
      </Container>
      </Container>
    </AppLayout>
  );
}
