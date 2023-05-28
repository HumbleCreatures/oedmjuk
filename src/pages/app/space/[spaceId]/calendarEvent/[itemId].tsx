import { useRouter } from "next/router";
import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import {
  Container,
  Text,
  Title,
  createStyles,
  Group,
  ThemeIcon,
  Badge,
  Button,
  List,
} from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from "../../../../../components/SpaceNavBar";
import { IconCalendarEvent, IconChartBar, IconColorSwatch, IconNotebook, IconRecycle, IconUserCheck, IconUserX } from "@tabler/icons";
import { DateTime } from "luxon";
import { UserLinkWithData } from "../../../../../components/UserButton";
import Link from "next/link";
import { useState } from "react";
import { IconUserQuestion } from "@tabler/icons-react";

const useStyles = createStyles((theme) => ({
  area: {
    backgroundColor: theme.colors.gray[4],
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  bodyArea: {
    backgroundColor: theme.white,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  areaTitle: {
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.xs,
  },
  mainTitle: {
    color: theme.white,
    fontSize: theme.fontSizes.xxl,
    marginTop: theme.spacing.xl,
  },
  editorWrapper: {
    marginTop: theme.spacing.md,
  },
  inlineText: {
    display: "inline",
  },
}));

function ContentView({ spaceId, itemId }: { spaceId: string; itemId: string }) {
  const { classes } = useStyles();
  const spaceResult = api.space.getSpace.useQuery({ spaceId });
  const calendarResult = api.calendarEvents.getCalendarEvent.useQuery({
    itemId,
  });
  const utils = api.useContext();
  const attendEventMutation = api.calendarEvents.setAttending.useMutation({
    onSuccess() {
      setChangeAttendee(false);
      void utils.calendarEvents.getCalendarEvent.invalidate({ itemId });
    },
  });
  const notAttendEventMutation = api.calendarEvents.setNotAttending.useMutation(
    {
      onSuccess() {
        setChangeAttendee(false);
        void utils.calendarEvents.getCalendarEvent.invalidate({ itemId });
      },
    }
  );
  const [changeAttendee, setChangeAttendee] = useState<boolean>(false);

  if (spaceResult.isLoading) return <div>loading...</div>;
  if (calendarResult.isLoading) return <div>loading...</div>;
  if (!spaceResult.data || !calendarResult.data)
    return <div>Could not find calendar event</div>;
  if (!calendarResult.data || !calendarResult.data.calendarEvent)
    return <div>calendar event not found</div>;
  const { space, isMember } = spaceResult.data;
  const { createdAt, updatedAt, title, body, startAt, endAt, creatorId } =
    calendarResult.data.calendarEvent;
  const amIAttending = calendarResult.data.myAttendee?.isAttending;

  return (
    <AppLayout>
      <Container size="sm">
        <SpaceNavBar space={space} isMember={isMember} />
        <Container size="sm">
          <Title order={2} className={classes.mainTitle}>
            {title}
          </Title>
        </Container>

        <Container size="sm" className={classes.area}>
          <Group position="apart">
            <Title order={2} className={classes.areaTitle}>
              Calendar event
            </Title>
            <ThemeIcon size="xl">
              <IconCalendarEvent />
            </ThemeIcon>
          </Group>
          <div>
            <Group position="apart">
              {" "}
              <FormattedEventDateAndTime startAt={startAt} endAt={endAt} />{" "}
              <CalendarBadge startAt={startAt} endAt={endAt} />
            </Group>
            <Text fz="sm" fw={300}>
              Created{" "}
              <Text fz="sm" fw={500} className={classes.inlineText}>
                {DateTime.fromJSDate(createdAt).setLocale("en").toRelative()}
              </Text>
            </Text>
            {updatedAt && updatedAt.getTime() !== createdAt.getTime() && (
              <Text fz="sm" fw={300}>
                Last updated{" "}
                <Text fz="sm" fw={500} className={classes.inlineText}>
                  {DateTime.fromJSDate(updatedAt).setLocale("en").toRelative()}
                </Text>
              </Text>
            )}
            <Text fz="sm">
              By{" "}
              <Text fz="sm" fw={500} className={classes.inlineText}>
                <UserLinkWithData userId={creatorId} />
              </Text>
            </Text>

            <Link href={`/app/space/${spaceId}/calendarEvent/${itemId}/edit`} passHref>
              <Button component="a">Edit</Button>
            </Link>
          </div>
        </Container>
        <Container size="sm" className={classes.bodyArea}>
          <div dangerouslySetInnerHTML={{ __html: body }} />
        </Container>
        <Container size="sm" className={classes.area}>
          <Title order={2} className={classes.areaTitle}>
            Agenda
          </Title>
          <List
            spacing="xs"
            size="sm"
            mb="xs"
            center
            icon={
              <ThemeIcon color="earth" size={24} radius="xl">
                <IconNotebook size="1rem" />
              </ThemeIcon>
            }
          >
            {calendarResult.data.calendarEvent.proposals.map((proposal) => (
              <List.Item key={proposal.id}>
                <Link href={`/app/space/${proposal.spaceId}/proposal/${proposal.id}`}>{proposal.title}</Link>
              </List.Item>
            ))}
          </List>

          <List
            spacing="xs"
            size="sm"
            mb="xs"
            center
            icon={
              <ThemeIcon color="earth" size={24} radius="xl">
                <IconColorSwatch size="1rem" />
              </ThemeIcon>
            }
          >
            {calendarResult.data.calendarEvent.selections.map((selection) => (
              <List.Item key={selection.id}>
                <Link href={`/app/space/${selection.spaceId}/selection/${selection.id}`}>{selection.title}</Link>
              </List.Item>
            ))}
          </List>

          <List
            spacing="xs"
            size="sm"
            mb="xs"
            center
            icon={
              <ThemeIcon color="earth" size={24} radius="xl">
                <IconChartBar size="1rem" />
              </ThemeIcon>
            }
          >
            {calendarResult.data.calendarEvent.dataIndices.map((dataIndex) => (
              <List.Item key={dataIndex.id}>
                <Link href={`/app/space/${dataIndex.spaceId}/dataIndex/${dataIndex.id}`}>{dataIndex.title}</Link>
              </List.Item>
            ))}
          </List>

          {calendarResult.data.calendarEvent.feedbackRound && <List
            spacing="xs"
            size="sm"
            mb="xs"
            center
            icon={
              <ThemeIcon color="earth" size={24} radius="xl">
                <IconRecycle size="1rem" />
              </ThemeIcon>
            }
          >
              <List.Item key={calendarResult.data.calendarEvent.feedbackRound.id}>
                <Link href={`/app/space/${calendarResult.data.calendarEvent.feedbackRound.spaceId}/feedback/${calendarResult.data.calendarEvent.feedbackRound.id}`}>{calendarResult.data.calendarEvent.feedbackRound.title}</Link>
              </List.Item>
          </List>}
        </Container>

        {amIAttending === undefined || changeAttendee ? (
          <Container size="sm" className={classes.area}>
            <Button
              onClick={() =>
                attendEventMutation.mutate({ calendarEventId: itemId })
              }
            >
              Attend
            </Button>{" "}
            <Button
              onClick={() =>
                notAttendEventMutation.mutate({ calendarEventId: itemId })
              }
            >
              Not attending
            </Button>
          </Container>
        ) : (
          <Container size="sm" className={classes.area}>
            <Group position="apart">
            <Text fz="sm" fw={500}>{amIAttending
              ? "You are attending this event"
              : "You are NOT tending this event"}</Text>
            <Button onClick={() => {setChangeAttendee(true)}}>Change</Button>
            </Group>
          </Container>
        )}
        <Container size="sm" className={classes.area}>
          <Title order={2} className={classes.areaTitle}>
            Attending
          </Title>
          <List
            spacing="xs"
            size="sm"
            center
            icon={
              <ThemeIcon color="earth" size={24} radius="xl">
                <IconUserCheck size="1rem" />
              </ThemeIcon>
            }
          >
            {calendarResult.data.attending.map((attendee) => (
              <List.Item key={attendee.id}>
                <UserLinkWithData userId={attendee.userId} />
              </List.Item>
            ))}
          </List>
        </Container>

        <Container size="sm" className={classes.area}>
          <Title order={2} className={classes.areaTitle}>
            Not attending
          </Title>
          <List
            spacing="xs"
            size="sm"
            center
            icon={
              <ThemeIcon color="earth" size={24} radius="xl">
                <IconUserX size="1rem" />
              </ThemeIcon>
            }
          >
            {calendarResult.data.notAttending.map((attendee) => (
              <List.Item key={attendee.id}>
                <UserLinkWithData userId={attendee.userId} />
              </List.Item>
            ))}
          </List>
        </Container>

        <Container size="sm" className={classes.area}>
          <Title order={2} className={classes.areaTitle}>
            Not answered
          </Title>
          <List
            spacing="xs"
            size="sm"
            center
            icon={
              <ThemeIcon color="earth" size={24} radius="xl">
                <IconUserQuestion size="1rem" />
              </ThemeIcon>
            }
          >
            {calendarResult.data.notAnswered.map((member) => (
              <List.Item key={member.id}>
                <UserLinkWithData userId={member.userId} />
              </List.Item>
            ))}
          </List>
        </Container>
      </Container>
    </AppLayout>
  );
}
const LoadingSpaceView: NextPage = () => {
  const router = useRouter();

  const { spaceId, itemId } = router.query;
  if (!spaceId || !itemId) return <div>loading...</div>;

  return <ContentView spaceId={spaceId as string} itemId={itemId as string} />;
};

export default LoadingSpaceView;

function FormattedEventDateAndTime({
  startAt,
  endAt,
}: {
  startAt: Date;
  endAt: Date;
}) {
  const currentTime = new Date();
  const { classes } = useStyles();
  if (currentTime.getTime() < startAt.getTime()) {
    if (currentTime.getDate() === startAt.getDate()) {
      if (startAt.getDate() === endAt.getDate()) {
        return (
          <Text fz="sm" fw={500}>
            Today
            <Text fz="sm" fw={500} className={classes.inlineText}>
              {" "}
              {DateTime.fromJSDate(startAt).toFormat("HH:mm")}
            </Text>{" "}
            -{" "}
            <Text fz="sm" fw={500} className={classes.inlineText}>
              {DateTime.fromJSDate(endAt).toFormat("HH:mm")}
            </Text>
          </Text>
        );
      } else {
        return (
          <div>
            <Text fz="sm" fw={300}>
              Today
              <Text fz="sm" fw={500} className={classes.inlineText}>
                {" "}
                {DateTime.fromJSDate(startAt).toFormat("HH:mm")}
              </Text>
            </Text>
            <Text fz="sm" fw={300}>
              Ends
              <Text fz="sm" fw={500} className={classes.inlineText}>
                {" "}
                {DateTime.fromJSDate(endAt).toFormat("DDDD HH:mm")}
              </Text>
            </Text>
          </div>
        );
      }
    }
  }

  if (startAt.getDate() === endAt.getDate()) {
    return (
      <Text fz="sm" fw={500}>
        {DateTime.fromJSDate(endAt).toFormat("DDDD")}{" "}
        {DateTime.fromJSDate(startAt).toFormat("HH:mm")} -{" "}
        {DateTime.fromJSDate(startAt).toFormat("HH:mm")}
      </Text>
    );
  }

  return (
    <div>
      <Text fz="sm" fw={500}>
        {DateTime.fromJSDate(startAt).toFormat("DDDD HH:mm")}
      </Text>

      <Text fz="sm" fw={500}>
        {DateTime.fromJSDate(endAt).toFormat("DDDD HH:mm")}
      </Text>
    </div>
  );
}

function CalendarBadge({ startAt, endAt }: { startAt: Date; endAt: Date }) {
  const currentTime = new Date();
  if (currentTime.getTime() < startAt.getTime()) {
    if (currentTime.getDate() === startAt.getDate()) {
      return <Badge>Today</Badge>;
    }
    return <></>;
  }
  if (currentTime.getTime() > endAt.getTime()) return <Badge>Passed</Badge>;
  if (currentTime.getTime() < endAt.getTime()) return <Badge>Ongoing</Badge>;

  return <></>;
}
