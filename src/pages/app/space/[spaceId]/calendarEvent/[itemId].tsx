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
  Button,
  List,
  Badge,
  SimpleGrid,
  Tabs,
} from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from "../../../../../components/SpaceNavBar";
import { IconCalendarEvent, IconChartBar, IconColorSwatch, IconNotebook, IconRecycle, IconUserCheck, IconUserX } from "@tabler/icons";
import { DateTime } from "luxon";
import { UserLinkWithData, UserLinkWithDataWhite } from "../../../../../components/UserButton";
import Link from "next/link";
import { useState } from "react";
import { IconUserQuestion } from "@tabler/icons-react";
import EditorJsRenderer from "../../../../../components/EditorJsRenderer";
import { SpaceLoader } from "../../../../../components/Loaders/SpaceLoader";
import { useGeneralStyles } from "../../../../../styles/generalStyles";
import { CalendarBadge } from "../../../../../components/CalendarEventStatusBadge";

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
  dateText: {
    display: "inline",
    color: theme.colors.earth[5],
  },
  agendaTitle: {
    borderTop: `2px solid ${theme.colors.earth[2]}`,
    fontSize: theme.fontSizes.sm,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.md,
  },

}));

function ContentView({ spaceId, itemId }: { spaceId: string; itemId: string }) {
  const { classes } = useStyles();
  const { classes: generalClasses } = useGeneralStyles();
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

  if (spaceResult.isLoading) return <SpaceLoader />;
  if (!spaceResult.data) return <div>Could not load space</div>;
  const { space, isMember } = spaceResult.data;
  
  if (calendarResult.isLoading) return <SpaceLoader space={space} isMember={isMember} />;
  if (!calendarResult.data) return <div>Could not load calendar event</div>;


  const { createdAt, updatedAt, title, body, startAt, endAt, creatorId } =
    calendarResult.data.calendarEvent;
  const amIAttending = calendarResult.data.myAttendee?.isAttending;
  const {notAnswered, attending, notAttending} = calendarResult.data;

  return (
    <AppLayout>
      <Container size="sm">
        <SpaceNavBar space={space} isMember={isMember} />
        <Container size="sm" className={generalClasses.area}>
          <div className={generalClasses.metaArea}>
        <Group position="apart" className={generalClasses.topGroup}>
          <Group className={generalClasses.topGroup}>
        <ThemeIcon size="xl">
        <IconCalendarEvent />
          </ThemeIcon>
          <div>
          <Text fz="sm" fw={500} >Calendar Event</Text>
        
          <Text fz="sm" fw={300} className={generalClasses.inlineText}>
            created{" "}
            <Text fz="sm" fw={500} className={classes.inlineText}>
              {DateTime.fromJSDate(createdAt).setLocale("en").toRelative()}
            </Text>
          </Text>

          <Text fz="sm" className={generalClasses.inlineText}>
            {" "}by{" "}
            <Text fz="sm" fw={500} className={classes.inlineText}>
              <UserLinkWithData userId={creatorId} />
            </Text>
          </Text>

          {updatedAt && updatedAt.getTime() !== createdAt.getTime() && (
            <Text fz="sm" fw={300}>
             last updated{" "}
              <Text fz="sm" fw={500} className={classes.inlineText}>
                {DateTime.fromJSDate(updatedAt).setLocale("en").toRelative()}
              </Text>
            </Text>
          )}

          
        </div>
          </Group>
          <Group position="right" spacing="xs" className={generalClasses.topGroup}>
          <Link href={`/app/space/${spaceId}/calendarEvent/${itemId}/edit`} passHref>
              <Button component="a">Edit</Button>
            </Link>

            {amIAttending === undefined || changeAttendee ? (<><Button
              onClick={() =>
                attendEventMutation.mutate({ calendarEventId: itemId })
              }
            >
              Attend
            </Button>
            <Button
              onClick={() =>
                notAttendEventMutation.mutate({ calendarEventId: itemId })
              }
            >
              Not attending
            </Button></>
        ) : (
            <Button onClick={() => {setChangeAttendee(true)}}>Change status</Button>
        )}
          </Group>
          
        </Group>
        </div>
        
        <div className={generalClasses.bodyArea}>
          <Group position="apart" className={generalClasses.topGroup}>
          <div>
          <Title order={2} className={generalClasses.mainTitle}>{title}</Title>
          <FormattedEventDateAndTime startAt={startAt} endAt={endAt} />
          </div>
          <SimpleGrid cols={1} spacing="xs">
        <CalendarBadge startAt={startAt} endAt={endAt} />
        {amIAttending
              ? <Badge color="green">Attending</Badge>
              : <Badge color="red">Not attending</Badge>}
        </SimpleGrid>
        </Group>
        
        {body && <EditorJsRenderer data={body} />}
        </div>

        <div className={generalClasses.bodyArea}>
          <Title order={3} className={classes.agendaTitle}>
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
        </div>

        </Container>


        <Container size="sm" className={generalClasses.clearArea}>
          <Title order={3} className={generalClasses.sectionTitle}>
            Participants
          </Title>
          <Tabs 
          styles={(theme) => ({
            tabsList: {
              border: 'none',
            },
            tab: { 
              color: theme.white,
              marginBottom: theme.spacing.xs,
              borderColor: theme.colors.earth[2],
              borderRadius: 0,
              '&[right-section]': {
                backgroundColor: theme.fn.rgba(theme.white, 0.1),
               },
              '&:hover': {
                backgroundColor: theme.fn.rgba(theme.white, 0.05),
                borderColor: theme.colors.earth[2],
              },
              '&[data-active]': {
                backgroundColor: theme.fn.rgba(theme.white, 0.1),
                borderColor: theme.white,
                color: theme.white,
              },
              '&[data-active]:hover': {
                backgroundColor: theme.fn.rgba(theme.white, 0.1),
                borderColor: theme.white,
                color: theme.white,
              },
            }
          })}>
      <Tabs.List grow>
        <Tabs.Tab
          rightSection={
            <Badge
              w={16}
              h={16}
              sx={{ pointerEvents: 'none' }}
              size="xs"
              p={0}
              
            >
              {attending.length}
            </Badge>
          }
          value="Attending"
        >
          Attending
        </Tabs.Tab>
        <Tabs.Tab value="absent"
        rightSection={
          <Badge
            w={16}
            h={16}
            sx={{ pointerEvents: 'none' }}
            size="xs"
            p={0}
            
          >
            {notAttending.length}
          </Badge>
        }>Absent</Tabs.Tab>
        <Tabs.Tab value="participants"
        rightSection={
          <Badge
            w={16}
            h={16}
            sx={{ pointerEvents: 'none' }}
            size="xs"
            p={0}
          >
            {notAnswered.length}
          </Badge>
        }>Not answered</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="attending">
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
              <List.Item key={attendee.id}  >
                <UserLinkWithDataWhite userId={attendee.userId} />
              </List.Item>
            ))}
          </List>
      </Tabs.Panel>
      <Tabs.Panel value="absent">
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
                <UserLinkWithDataWhite userId={attendee.userId} />
              </List.Item>
            ))}
          </List>
      </Tabs.Panel>
      <Tabs.Panel value="participants">
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
                <UserLinkWithDataWhite userId={member.userId} />
              </List.Item>
            ))}
          </List>
      </Tabs.Panel>
    </Tabs>

    
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
          <Text fz="sm" fw={500} className={classes.dateText}>
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
            <Text fz="sm" fw={300} className={classes.dateText}>
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
      <Text fz="sm" fw={500} className={classes.dateText}>
        {DateTime.fromJSDate(endAt).toFormat("DDDD")}{" "}
        {DateTime.fromJSDate(startAt).toFormat("HH:mm")} -{" "}
        {DateTime.fromJSDate(startAt).toFormat("HH:mm")}
      </Text>
    );
  }

  return (
    <div>
      <Text fz="sm" fw={500} className={classes.dateText}>
        {DateTime.fromJSDate(startAt).toFormat("DDDD HH:mm")}
      </Text>

      <Text fz="sm" fw={500} className={classes.dateText}>
        {DateTime.fromJSDate(endAt).toFormat("DDDD HH:mm")}
      </Text>
    </div>
  );
}


