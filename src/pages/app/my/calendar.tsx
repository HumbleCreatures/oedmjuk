import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../components/AppLayout";
import { Container, Title, createStyles } from "@mantine/core";
import { api } from "../../../utils/api";
import { Calendar, luxonLocalizer } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { DateTime } from "luxon";

const localizer = luxonLocalizer(DateTime, {
    firstDayOfWeek: 1, // Monday
  });

const useStyles = createStyles((theme) => ({
  area: {
    backgroundColor: theme.white,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  areaTitle: {
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.md,
  }
}));

const MyCalendarPage: NextPage = () => {
  const router = useRouter();
  const { classes } = useStyles();
  

  const eventsRequest = api.calendarEvents.getMyCalendarEvents.useQuery();
  if(eventsRequest.isLoading) return (<div>loading...</div>);
  if(eventsRequest.error) return (<div>error</div>);
  if(eventsRequest.data === undefined) return (<div>not found</div>);
  const events = eventsRequest.data.map((event) => {
    return {
      id: event.id,
      title: event.title,
      start: event.startAt,
      end: event.endAt,
      spaceId: event.spaceId,
    }
  })

  return (
    <AppLayout>
      <Container size="md">
      <div className={classes.area}>
        <Title order={2} className={classes.areaTitle}>My Calendar</Title>
        <Calendar
        defaultView='week'
        events={events}
        localizer={localizer}
        onDoubleClickEvent={(event: {id: string, spaceId: string}) => {
          void router.push(`/app/space/${event.spaceId}/calendarEvent/${event.id}`)
        }}
        style={{ height: '100vh' }}
        />

      </div>
      </Container>
    </AppLayout>
  );
} 


export default MyCalendarPage;
