import { type NextPage } from "next";
import AppLayout from "../../../components/AppLayout";
import { useForm } from "@mantine/form";
import { TextInput, Button, Container, Title, Alert, Text, createStyles, Accordion } from "@mantine/core";
import { api } from "../../../utils/api";
import { IconAlertCircle } from '@tabler/icons';
import { SettingsNavBar } from "../../../components/SettingsNavBar";
import { DynamicBlockEditor } from "../../../components/DynamicBlockEditor";
import type { OutputData } from '@editorjs/editorjs';

const useStyles = createStyles((theme) => ({
  area: {
    backgroundColor: theme.colors.gray[4],
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  editArea: {
    backgroundColor: theme.colors.gray[0],
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  areaTitle: {
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.md,
  },
  editorWrapper: {
    marginTop: theme.spacing.md,
  },
  fullWidth: {
    width: "100%",
  },
}));

const DataIndexTypesPage: NextPage = () => {
  const { classes } = useStyles();
  const form = useForm({
    initialValues: {
      name: "",
      unitName: "",
      description: "",
    },
    validate: {
        name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
        unitName: (value) => {
          if(value.length < 1) return "Name must have at least 1 letters";
          if(value.length > 10) return "Name must have at most 10 letters";
        }
        
    },
  });

  const utils = api.useContext();
  const query = api.dataIndex.getAllIndexTypes.useQuery();
  const mutation = api.dataIndex.createDataIndexType.useMutation({
    onSuccess() {
      void utils.dataIndex.getAllIndexTypes.invalidate();
    },
  });


  if(query.isLoading) return (<div>loading...</div>);
  if(!query.data) return (<div>could not load types...</div>);



  return (
    <AppLayout>
      <Container size="sm">
      <SettingsNavBar />
      <Container size="sm" className={classes.area}>
      <Title className={classes.areaTitle} order={2}>Data index types</Title>
      <Accordion variant="filled" >
      

      {query.data.map((indexType) =>{
        return (

          <Accordion.Item key={indexType.id} value={indexType.id}>
          <Accordion.Control><Text>{indexType.name}</Text> <Text size="sm" color="dimmed" weight={400}>{indexType.unitName}</Text></Accordion.Control>
          <Accordion.Panel><div dangerouslySetInnerHTML={{__html: indexType.description ? indexType.description : ''}}></div></Accordion.Panel>
        </Accordion.Item>
        )
      })}
      </Accordion>
      </Container>
      <Container size="sm" className={classes.editArea}>
        <Title order={1}>Create a new data index type</Title>

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
          <TextInput
            label="Unit Name"
            placeholder="Unit Name"
            {...form.getInputProps("unitName")}
          />
          <div>Body</div>
          <DynamicBlockEditor holder="blockeditor-container" onChange={(data:OutputData) => {
            form.setFieldValue('description', JSON.stringify(data))}}  />
          <Button type="submit" mt="sm">
            Submit
          </Button>
            
          {mutation.error && 
           <Alert icon={<IconAlertCircle size={16} />} title="Bummer!" color="red">Something went wrong! {mutation.error.message}</Alert>}
        </form>
      </Container>
      </Container>
    </AppLayout>
  );
};

export default DataIndexTypesPage;
