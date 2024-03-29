import { useRouter } from "next/router";
import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import {
  Alert,
  Button,
  Container,
  TextInput,
  Title,
  createStyles,
  Text,
} from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from "../../../../../components/SpaceNavBar";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons";
import { DynamicTemplatedBlockEditor } from '../../../../../components/DynamicTemplatedBlockEditor';
import type { OutputData } from '@editorjs/editorjs';

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

function FeedbackEditorComponent({ spaceId }: { spaceId: string }) {
  const { classes } = useStyles();
  const data = api.space.getSpace.useQuery({ spaceId }).data;

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
  // const utils = api.useContext();
  const mutation = api.feedback.createFeedbackRound.useMutation({
    onSuccess(data) {
      void router.push(`/app/space/${space.id}/feedback/${data.id}`);
    },
  });

  const router = useRouter();

  if (!data || !data.space) return <div>loading...</div>;
  const { space, isMember } = data;

  return (
    <AppLayout>
      <Container size="sm">
        <SpaceNavBar space={space} isMember={isMember} />
        <Container size="sm" className={classes.area}>
          <Title className={classes.areaTitle} order={2}>
            Create a new feedback round
          </Title>

          <form
            onSubmit={form.onSubmit((values) => {
              mutation.mutate({ ...values, spaceId: space.id });
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
              <DynamicTemplatedBlockEditor holder="blockeditor-container" onChange={(data:OutputData) => {
              form.setFieldValue('body', JSON.stringify(data))}}  />
              </div>
            <Button type="submit" mt="sm">
              Create
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
const FeedbackEditor: NextPage = () => {
  const router = useRouter();

  const { spaceId } = router.query;
  if (!spaceId) return <div>loading...</div>;

  return <FeedbackEditorComponent spaceId={spaceId as string} />;
};

export default FeedbackEditor;
