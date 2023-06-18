import { type NextPage } from "next";
import AppLayout from "../../../components/AppLayout";
import { useForm } from "@mantine/form";
import { TextInput, Button, Container, Title, Alert, Text, createStyles, Accordion } from "@mantine/core";
import { api } from "../../../utils/api";
import { IconAlertCircle } from '@tabler/icons';
import { useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { RichTextEditor } from '@mantine/tiptap';
import { SettingsNavBar } from "../../../components/SettingsNavBar";
import { SettingsLoader } from "../../../components/Loaders/SettingsLoader";

const useStyles = createStyles((theme) => ({
  area: {
    backgroundColor: theme.colors.gray[4],
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  clearArea: {
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
    color: theme.white,
    padding: 0
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
      description: "",
    },
    validate: {
        name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null        
    },
  });

  const utils = api.useContext();
  const query = api.bodyTemplate.getAllTemplates.useQuery();
  const mutation = api.bodyTemplate.createTemplate.useMutation({
    onSuccess() {
      void utils.bodyTemplate.getAllTemplates.invalidate();
    },
  });

  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: 'This is placeholder' })],
    content: '',
    onUpdate({ editor }) {
      form.setFieldValue('description', editor.getHTML())
    },
  });

  if(query.isLoading) return (<SettingsLoader />);
  if(!query.data) return (<div>could not load types...</div>);



  return (
    <AppLayout>
      <Container size="sm">
      <SettingsNavBar />
      <Container size="sm" className={classes.clearArea}>
      <Title className={classes.areaTitle} order={2}>Content Templates</Title>
      <Accordion variant="filled" >
      

      {query.data.map((template) =>{
        return (

          <Accordion.Item key={template.id} value={template.id}>
          <Accordion.Control><Text>{template.bodyTemplateVersions}</Text> <Text size="sm" color="dimmed" weight={400}>{template.unitName}</Text></Accordion.Control>
          <Accordion.Panel><div dangerouslySetInnerHTML={{__html: template.description ? template.description : ''}}></div></Accordion.Panel>
        </Accordion.Item>
        )
      })}
      </Accordion>
      </Container>
      <Container size="sm" className={classes.editArea}>
        <Title order={2} className={classes.areaTitle}>Create a new template</Title>

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
         
          <div>Template Body</div>
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
};

export default DataIndexTypesPage;
