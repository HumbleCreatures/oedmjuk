import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import { Alert, Button, Container, TextInput, Title } from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from '../../../../../components/SpaceNavBar';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons';
import { useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { RichTextEditor } from '@mantine/tiptap';



function ProposalEditorComponent({spaceId}: {spaceId: string}) {
  const data = api.space.getSpace.useQuery({spaceId}).data;
  const form = useForm({
    initialValues: {
      title: "",
      body: "",
    },
    validate: {
      title: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
    },
  });
  const utils = api.useContext();
  const mutation = api.proposal.createProposal.useMutation({
    onSuccess(data) {
      void utils.proposal.getSpaceProposals.invalidate();
      void router.push(`/app/space/${space.id}/proposal/${data.id}`);
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

 
  
  return (
    <AppLayout>
      <Container size="xs">
      <SpaceNavBar space={space} isMember={isMember}/>
      <Container size="xs">
        <Title order={1}>Create a new proposal</Title>

        <form
          onSubmit={form.onSubmit((values) => {
            mutation.mutate({...values, spaceId: space.id});
          })}
        >
          <TextInput
            label="Title"
            placeholder="Title"
            {...form.getInputProps("title")}
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
const ProposalEditor: NextPage = () => {
  const router = useRouter()
  
  const { spaceId } = router.query;
  if(!spaceId) return (<div>loading...</div>);

  
  return (
    <ProposalEditorComponent spaceId={spaceId as string} />
  );
};

export default ProposalEditor;
