import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import { Alert, Button, Container, Select, TextInput, Title } from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from '../../../../../components/SpaceNavBar';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons';
import { useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { RichTextEditor } from '@mantine/tiptap';



function SpaceView({spaceId}: {spaceId: string}) {
  const data = api.space.getSpace.useQuery({spaceId}).data;
  const indexTypeQuery = api.dataIndex.getAllIndexTypes.useQuery();

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      dataIndexTypeId: "",
    },
    validate: {
      name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
        dataIndexTypeId: (value) => !value ? "Please select a index type" : null,
    },
  });
  const utils = api.useContext();
  const mutation = api.content.createContent.useMutation({
    onSuccess(data) {
      void utils.space.getSpace.invalidate();
      void router.push(`/app/space/${space.id}/content/${data.id}`);
    },
  });

  const router = useRouter();

  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: 'This is placeholder' })],
    content: '',
    onUpdate({ editor }) {
      form.setFieldValue('body', editor.getHTML())
    },
  });
  if(!data || !data.space) return (<div>loading...</div>)
  const {space, isMember} = data;

  if(indexTypeQuery.isLoading) return (<div>loading...</div>);
  if(!indexTypeQuery.data) return (<div>could not load types...</div>);

  const indexTypes = indexTypeQuery.data.map((indexType) => { return { label: indexType.name, value: indexType.id }});
  
  return (
    <AppLayout>
      <Container size="xs">
      <SpaceNavBar space={space} isMember={isMember}/>
      <Container size="xs">
        <Title order={1}>Create a new space</Title>

        <form
          onSubmit={form.onSubmit((values) => {
            mutation.mutate({...values, spaceId: space.id});
          })}
        >
          <TextInput
            label="Name"
            placeholder="Name"
            {...form.getInputProps("name")}
          />
          <Select
            label="Select index type"
            placeholder="Pick one"
            searchable
            nothingFound="No options"
            data={indexTypes}
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


      </Container>
    </AppLayout>
  );
} 
const LoadingSpaceView: NextPage = () => {
  const router = useRouter()
  
  const { spaceId } = router.query;
  if(!spaceId) return (<div>loading...</div>);

  
  return (
    <SpaceView spaceId={spaceId as string} />
  );
};

export default LoadingSpaceView;
