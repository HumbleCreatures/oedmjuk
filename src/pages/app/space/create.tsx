import { type NextPage } from "next";
import AppLayout from "../../../components/AppLayout";
import { useForm } from "@mantine/form";
import { TextInput, Button, Container, Title, Alert } from "@mantine/core";
import { api } from "../../../utils/api";
import { IconAlertCircle } from '@tabler/icons';
import { useRouter } from "next/router";

const CreateSpace: NextPage = () => {
  const form = useForm({
    initialValues: {
      name: "",
    },
    validate: {
      name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
    },
  });

  const router = useRouter();

  const mutation = api.space.createSpace.useMutation({
    onSuccess(data) {
      void utils.space.getAllSpaces.invalidate();
      void router.push(`/app/space/${data.id}`);
    },
  });

  const utils = api.useContext();
  return (
    <AppLayout>
      <Container size="xs">
        <Title order={1}>Create a new space</Title>

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
            Submit
          </Button>
            
          {mutation.error && 
           <Alert icon={<IconAlertCircle size={16} />} title="Bummer!" color="red">Something went wrong! {mutation.error.message}</Alert>}
        </form>
      </Container>
    </AppLayout>
  );
};

export default CreateSpace;
