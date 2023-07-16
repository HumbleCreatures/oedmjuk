import { type NextPage } from "next";
import AppLayout from "../AppLayout";
import { Container, createStyles, Loader } from "@mantine/core";
import { SettingsNavBar } from "../SettingsNavBar";

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

export function SettingsLoader() {
  const { classes } = useStyles();

  return (
    <AppLayout>
      <Container size="sm">
      <SettingsNavBar />
      <Container size="sm" className={classes.loaderArea}>
        <Loader className={classes.loaderPosition} />
      </Container>
      </Container>
    </AppLayout>
  );
};

