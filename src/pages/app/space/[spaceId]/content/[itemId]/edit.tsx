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
import { useEffect } from "react";
import { OutputData } from "@editorjs/editorjs";
import { DynamicBlockEditor } from "../../../../../../components/DynamicBlockEditor";
import { SpaceLoader } from "../../../../../../components/Loaders/SpaceLoader";

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
  
  const spaceResult = api.space.getSpace.useQuery({ spaceId });
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

  useEffect(() => {
    if (contentQuery.data) {
      form.setValues(contentQuery.data);
    }
   }, [contentQuery.data])

  if (spaceResult.isLoading) return <SpaceLoader />;
  if (!spaceResult.data) return <div>Did not find space.</div>;
  if (contentQuery.isLoading) return <SpaceLoader space={spaceResult.data?.space} isMember={spaceResult.data?.isMember}/>;
  if (!contentQuery.data) return <div>Did not find calendar event.</div>;
  const { space, isMember } = spaceResult.data;
  
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
              <DynamicBlockEditor data={contentQuery.data.body ? JSON.parse(contentQuery.data.body) as OutputData : undefined} holder="blockeditor-container" onChange={(data:OutputData) => {
            form.setFieldValue('body', JSON.stringify(data))}}  />
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
