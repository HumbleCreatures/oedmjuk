import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import { Alert, Button, Container, Select, TextInput, Title, createStyles, Text } from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from '../../../../../components/SpaceNavBar';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons';
import { useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { RichTextEditor } from '@mantine/tiptap';

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

  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: 'This is placeholder' })],
    content: '',
    onUpdate({ editor }) {
      form.setFieldValue('description', editor.getHTML())
    },
  });
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
                Body
              </Text>
          <RichTextEditor editor={editor}>
          <RichTextEditor.Toolbar sticky stickyOffset={60}>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Strikethrough />
          <RichTextEditor.ClearFormatting />
          <RichTextEditor.Highlight />
          <RichTextEditor.Code />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
          <RichTextEditor.H4 />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Blockquote />
          <RichTextEditor.Hr />
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
        </RichTextEditor.ControlsGroup>


      </RichTextEditor.Toolbar>
            <RichTextEditor.Content />
          </RichTextEditor></div>
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
