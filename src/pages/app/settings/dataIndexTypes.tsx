import { type NextPage } from "next";
import AppLayout from "../../../components/AppLayout";
import { useForm } from "@mantine/form";
import { Group, TextInput, Button, Container, Title, Alert, Text, createStyles, Accordion, SimpleGrid } from "@mantine/core";
import { api } from "../../../utils/api";
import { IconAlertCircle } from '@tabler/icons';
import { SettingsNavBar } from "../../../components/SettingsNavBar";
import { DynamicBlockEditor } from "../../../components/DynamicBlockEditor";
import type { OutputData } from '@editorjs/editorjs';
import { useGeneralStyles } from "../../../styles/generalStyles";
import Link from "next/link";
import { SettingsLoader } from "../../../components/Loaders/SettingsLoader";

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
  },
  editorWrapper: {
    marginTop: theme.spacing.md,
  },
  fullWidth: {
    width: "100%",
  },
  listItemText: {
    fontSize: theme.fontSizes.md,
    fontWeight: 500,
    paddingLeft: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  }
}));

const DataIndexTypesPage: NextPage = () => {
  const { classes } = useStyles();
  const { classes: generalClasses } = useGeneralStyles();
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


  if(query.isLoading) return (<SettingsLoader />);
  if(!query.data) return (<div>could not load types...</div>);



  return (
    <AppLayout>
      <Container size="sm">
      <SettingsNavBar />


      <Container size="sm" className={generalClasses.clearArea}>
      <div className={generalClasses.listHeader}>
      <Title className={classes.areaTitle} order={2}>Data index types</Title>
      </div>
      <SimpleGrid cols={1} spacing="xs">

    
      

      {query.data.map((indexType) =>{
       
        return (
          <Link className={generalClasses.listLinkItem} key={indexType.id} href={`/app/settings/dataIndexType/${indexType.id}`}>
          <Text className={classes.listItemText}>{indexType.name} ({indexType.unitName})</Text>
          </Link>
        )
      })}
      </SimpleGrid>
      </Container>
      <Container size="sm" className={classes.editArea}>
        <Title order={1}  className={classes.areaTitle}>Create a new data index type</Title>

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
          <Text fz="sm" fw={500}>Description</Text>
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
