import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import { Alert, Button, Container, Select, TextInput, Title, createStyles, Text } from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from '../../../../../components/SpaceNavBar';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons';
import type { OutputData } from '@editorjs/editorjs';
import { DynamicBlockEditor } from '../../../../../components/DynamicBlockEditor';

const useStyles = createStyles((theme) => ({
  area: {
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

function DataIndexEditorView({spaceId}: {spaceId: string}) {
  const { classes } = useStyles();
  const data = api.space.getSpace.useQuery({spaceId}).data;
  const indexTypeQuery = api.dataIndex.getAllIndexTypes.useQuery();

  const form = useForm({
    initialValues: {
      title: "",
      description: "",
      unitTypeId: "",
    },
    validate: {
      title: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
        unitTypeId: (value) => value.length === 0 ? "Please select a index type" : null,
    },
  });
  const utils = api.useContext();
  const mutation = api.dataIndex.createDataIndex.useMutation({
    onSuccess(data) {
      void utils.space.getSpace.invalidate();
      void router.push(`/app/space/${space.id}/dataIndex/${data.id}`);
    },
  });

  const router = useRouter();

  if(!data || !data.space) return (<div>loading...</div>)
  const {space, isMember} = data;

  if(indexTypeQuery.isLoading) return (<div>loading...</div>);
  if(!indexTypeQuery.data) return (<div>could not load types...</div>);

  const indexTypes = indexTypeQuery.data.map((indexType) => { return { label: indexType.name, value: indexType.id }});
  
  return (
    <AppLayout>
      <Container size="sm">
      <SpaceNavBar space={space} isMember={isMember}/>
      <Container size="sm" className={classes.area}>
          <Title className={classes.areaTitle} order={2}>
            Create a new data index 
          </Title>

        <form
          onSubmit={form.onSubmit((values) => {
            console.log(values);
            mutation.mutate({...values, spaceId: space.id});
          })}
        >
          <TextInput
            label="Title"
            placeholder="Title"
            {...form.getInputProps("title")}
          />
          <Select
            className={classes.editorWrapper}
            label="Select index type"
            placeholder="Pick one"
            searchable
            nothingFound="No options"
            data={indexTypes}
            {...form.getInputProps("unitTypeId")}
          />

<div className={classes.editorWrapper}>
              <Text fz="sm" fw={500}>
                Description
              </Text>
              <DynamicBlockEditor holder="blockeditor-container" onChange={(data:OutputData) => {
            form.setFieldValue('description', JSON.stringify(data))}}  />
          </div>
          <Button type="submit" mt="sm">
            Create
          </Button>
            
          {mutation.error && 
           <Alert icon={<IconAlertCircle size={16} />} title="Bummer!" color="red">Something went wrong! {mutation.error.message}</Alert>}
        </form>
      </Container>
      </Container>
    </AppLayout>
  );
} 
const DataIndexEditorPage: NextPage = () => {
  const router = useRouter()
  
  const { spaceId } = router.query;
  if(!spaceId) return (<div>loading...</div>);

  
  return (
    <DataIndexEditorView spaceId={spaceId as string} />
  );
};

export default DataIndexEditorPage;
