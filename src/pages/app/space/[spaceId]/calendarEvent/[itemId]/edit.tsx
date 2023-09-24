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
  SimpleGrid,
  MultiSelect,
} from "@mantine/core";
import { api } from "../../../../../../utils/api";
import { SpaceNavBar } from "../../../../../../components/SpaceNavBar";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons";
import { DateTimePicker } from "@mantine/dates";
import { useEffect } from "react";
import { ProposalToCalendarEventEditor } from "../../../../../../components/ProposalToCalendarEventEditor";
import { SelectionToCalendarEventEditor } from "../../../../../../components/SelectionToCalendarEventEditor";
import { DataIndexToCalendarEventEditor } from "../../../../../../components/DataIndexToCalendarEventEditor";
import { FeedbackRoundToCalendarEventEditor } from "../../../../../../components/FeedbackRoundToCalendarEventEditor";
import { DynamicBlockEditor } from "../../../../../../components/DynamicBlockEditor";
import { OutputData } from "@editorjs/editorjs";
import { AccessRequestToCalendarEventEditor } from "../../../../../../components/AccessRequesrtToCalendarEventEditor";

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
  const calendarEventQuery = api.calendarEvents.getCalendarEvent.useQuery({
    itemId,
  });


  const form = useForm({
    initialValues: {
      title: calendarEventQuery.data?.calendarEvent.title || "",
      body: calendarEventQuery.data?.calendarEvent.body || "",
      startAt: calendarEventQuery.data?.calendarEvent.startAt || new Date(),
      endAt: calendarEventQuery.data?.calendarEvent.startAt || new Date(),
    },
    validate: {
      title: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
      startAt: (value) =>
        value === undefined ? "Start date must be set" : null,
      endAt: (value) => (value === undefined ? "End date must be set" : null),
    },
  });
  const utils = api.useContext();
  const mutation = api.calendarEvents.updateCalendarEvent.useMutation({
    onSuccess(data) {
      void utils.space.getSpace.invalidate();
      void router.push(`/app/space/${spaceId}/calendarEvent/${data.id}`);
    },
  });



  const router = useRouter();
  useEffect(() => {
    if (calendarEventQuery.data) {
      form.setValues(calendarEventQuery.data.calendarEvent);
    }
   }, [calendarEventQuery.data])
  if (spaceQuery.isPlaceholderData) return <div>Loading ...</div>;
  if (!spaceQuery.data) return <div>Did not find space.</div>;
  if (calendarEventQuery.isLoading) return <div>Loading ...</div>;
  if (!calendarEventQuery.data) return <div>Did not find calendar event.</div>;


  const { space, isMember } = spaceQuery.data;
  


  return (
    <AppLayout>
      <Container size="sm">
        <SpaceNavBar space={space} isMember={isMember} />
        <Container size="sm" className={classes.area}>
          <Title className={classes.areaTitle} order={2}>
            Edit calendar event
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
            <SimpleGrid cols={2} className={classes.editorWrapper}>
              <DateTimePicker
                className={classes.fullWidth}
                dropdownType="modal"
                valueFormat="YYYY-MM-DD HH:mm"
                label="Start date and time"
                placeholder="Pick date and time"
                maw={400}
                mx="auto"
                {...form.getInputProps("startAt")}
              />

              <DateTimePicker
                className={classes.fullWidth}
                dropdownType="modal"
                valueFormat="YYYY-MM-DD HH:mm"
                label="End date and time"
                placeholder="Pick date and time"
                maw={400}
                mx="auto"
                {...form.getInputProps("endAt")}
              />
            </SimpleGrid>
            <div className={classes.editorWrapper}>
              <Text fz="sm" fw={500}>
                Body
              </Text>
              <div className={classes.editorWrapper}>
              <Text fz="sm" fw={500}>
                Body
              </Text>
              <DynamicBlockEditor data={form.getInputProps('body').value ? JSON.parse(form.getInputProps('body').value as string) as OutputData : undefined} holder="blockeditor-container" onChange={(data:OutputData) => {
            form.setFieldValue('body', JSON.stringify(data))}}  />
            </div>
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
