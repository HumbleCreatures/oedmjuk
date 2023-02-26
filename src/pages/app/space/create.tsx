import { type NextPage } from "next";
import AppLayout from "../../../components/AppLayout";
import { useForm } from '@mantine/form';
import { TextInput, Button } from '@mantine/core';

const CreateSpace: NextPage = () => {
  const form = useForm({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 letters' : null),
    },
  });

  return (
    <AppLayout>
     <form onSubmit={form.onSubmit(console.log)}>
      <TextInput label="Name" placeholder="Name" {...form.getInputProps('name')} />
      <Button type="submit" mt="sm">
        Submit
      </Button>
    </form>
    </AppLayout>
  );
};

export default CreateSpace;
