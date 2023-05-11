import { type NextPage } from "next";
import AppLayout from "../../../components/AppLayout";
import { useForm } from "@mantine/form";
import { TextInput, Button, Container, Title, Alert, Text } from "@mantine/core";
import { api } from "../../../utils/api";
import { IconAlertCircle } from '@tabler/icons';
import { useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { RichTextEditor } from '@mantine/tiptap';

const DataIndexTypesPage: NextPage = () => {
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

  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: 'This is placeholder' })],
    content: '',
    onUpdate({ editor }) {
      form.setFieldValue('description', editor.getHTML())
    },
  });

  if(query.isLoading) return (<div>loading...</div>);
  if(!query.data) return (<div>could not load types...</div>);



  return (
    <AppLayout>
      <Container size="xs">
        <Text>Data Index Types</Text>
      {query.data.map((indexType) =>{
        return (
          <div key={indexType.id}>
            <div>{indexType.name}</div>
            <div>{indexType.unitName}</div>
            <div>{indexType.description}</div>
          </div>
        )
      })}
      </Container>
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
          <TextInput
            label="Unit Name"
            placeholder="Unit Name"
            {...form.getInputProps("unitName")}
          />
          <div>Body</div>
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
          </RichTextEditor>
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

export default DataIndexTypesPage;
