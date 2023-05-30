import { type NextPage } from "next";
import AppLayout from "../../../components/AppLayout";
import { useForm } from "@mantine/form";
import { TextInput, Button, Container, Title, Alert, createStyles, Card, SimpleGrid } from "@mantine/core";
import { api } from "../../../utils/api";
import { IconAlertCircle } from '@tabler/icons';
import { useRouter } from "next/router";
import Link from "next/link";

const useStyles = createStyles((theme) => ({
  area: {
    backgroundColor: theme.colors.gray[4],
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  formArea: {
    backgroundColor: theme.white,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  areaTitle: {
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.md,
  }
}));


const CreateSpace: NextPage = () => {
  const { classes } = useStyles();

  const router = useRouter();

  const spacesRequest = api.space.getAllSpaces.useQuery();
  const utils = api.useContext();
  const mutation = api.space.createSpace.useMutation({
    onSuccess(data) {
      void utils.space.getAllSpaces.invalidate();
      void router.push(`/app/space/${data.id}`);
    },
  });

  const form = useForm({
    initialValues: {
      name: "",
    },
    validate: {
      name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
    },
  });

  

  if(spacesRequest.isLoading) return (<div>loading...</div>);
  if(spacesRequest.error) return (<div>error</div>);
  if(spacesRequest.data === undefined) return (<div>spaces not found</div>);

  
  return (
    <AppLayout>
      <Container size="sm" className={classes.area}>
        <Title order={2} className={classes.areaTitle}>Available spaces</Title>
        <SimpleGrid cols={1}>
        {spacesRequest.data.map((space) => {
          return (
            <Link key={space.id}  href={`/app/space/${space.id}`}>
            <Card withBorder shadow="sm" radius="md" style={{overflow: 'visible'}}>
            <Card.Section withBorder inheritPadding py="xs">
             {space.name}
            </Card.Section>
            </Card></Link>
            
          );
        })}</SimpleGrid>

      </Container>
      <Container size="sm" className={classes.formArea}>
        <Title order={2} className={classes.areaTitle}>Create a new space</Title>

        <form
          onSubmit={form.onSubmit((values) => {
            mutation.mutate(values);
          })}
        >
          <TextInput
            label="Name"
            placeholder="Name"
            {...form.getInputProps("name")}
          />
          <Button type="submit" mt="sm">
            Create space
          </Button>
            
          {mutation.error && 
           <Alert icon={<IconAlertCircle size={16} />} title="Bummer!" color="red">Something went wrong! {mutation.error.message}</Alert>}
        </form>
      </Container>
    </AppLayout>
  );
};

export default CreateSpace;
