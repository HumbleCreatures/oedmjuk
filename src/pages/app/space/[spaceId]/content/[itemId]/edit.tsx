import { useRouter } from "next/router";
import { type NextPage } from "next";
import AppLayout from "../../../../../../components/AppLayout";
import {
  Alert,
  Button,
  Container,
  TextInput,
  Title,
  createStyles,
  Text,
} from "@mantine/core";
import { api } from "../../../../../../utils/api";
import { SpaceNavBar } from "../../../../../../components/SpaceNavBar";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { RichTextEditor } from "@mantine/tiptap";
import { useEffect } from "react";

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

function SpaceView({ spaceId, itemId }: { spaceId: string; itemId: string }) {
  const { classes } = useStyles();
  
  const spaceQuery = api.space.getSpace.useQuery({ spaceId });
  const contentQuery = api.content.getContent.useQuery({
    itemId,
  });


  const form = useForm({
    initialValues: {
      title: contentQuery.data?.title || "",
      body: contentQuery.data?.body || "",
    },
    validate: {
      title: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
    },
  });
  const utils = api.useContext();
  const mutation = api.content.updateContent.useMutation({
    onSuccess(data) {
      void utils.space.getSpace.invalidate();
      void router.push(`/app/space/${spaceId}/content/${data.id}`);
    },
  });



  const router = useRouter();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "This is placeholder" }),
    ],
    content: "",
    onUpdate({ editor }) {
      form.setFieldValue("body", editor.getHTML());
    },
  });
  useEffect(() => {
    if (contentQuery.data) {
      form.setValues(contentQuery.data);
      if(editor) {
        editor.commands.setContent(contentQuery.data.body);
      }
    }
   }, [editor, contentQuery.data])
  if (spaceQuery.isPlaceholderData) return <div>Loading ...</div>;
  if (!spaceQuery.data) return <div>Did not find space.</div>;
  if (contentQuery.isLoading) return <div>Loading ...</div>;
  if (!contentQuery.data) return <div>Did not find calendar event.</div>;


  const { space, isMember } = spaceQuery.data;
  


  return (
    <AppLayout>
      <Container size="sm">
        <SpaceNavBar space={space} isMember={isMember} />
        <Container size="sm" className={classes.area}>
          <Title className={classes.areaTitle} order={2}>
            Edit content
          </Title>

          <form
            onSubmit={form.onSubmit((values) => {
              console.log(values);
              mutation.mutate({ ...values, itemId });
            })}
          >
            <TextInput
              label="Title"
              placeholder="Title"
              {...form.getInputProps("title")}
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
              </RichTextEditor>
            </div>

            <Button type="submit" mt="sm">
              Update
            </Button>

            {mutation.error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Bummer!"
                color="red"
              >
                Something went wrong! {mutation.error.message}
              </Alert>
            )}
          </form>
        </Container>

      </Container>
    </AppLayout>
  );
}
const EditCalendarEventView: NextPage = () => {
  const router = useRouter();

  const { spaceId, itemId } = router.query;
  if (!spaceId || !itemId) return <div>loading...</div>;

  return <SpaceView spaceId={spaceId as string} itemId={itemId as string} />;
};

export default EditCalendarEventView;
