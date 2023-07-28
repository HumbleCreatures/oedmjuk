import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../../components/AppLayout";
import { Container, Title, SimpleGrid, createStyles } from "@mantine/core";
import { api } from "../../../../utils/api";
import { SpaceNavBar } from '../../../../components/SpaceNavBar';
import { Calendar, luxonLocalizer, Event } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { DateTime } from "luxon";
import { SpaceLoader } from '../../../../components/Loaders/SpaceLoader';

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

function SpaceView({spaceId}: {spaceId: string}) {
  const router = useRouter();
  const { classes } = useStyles();
  

  const spaceResult = api.space.getSpace.useQuery({spaceId});
  const eventsResult = api.calendarEvents.getCalendarEventsForSpace.useQuery({spaceId});
  if (spaceResult.isLoading) return <SpaceLoader />;
  if (!spaceResult.data)
    return <div>Could not find space</div>;
  const { space, isMember } = spaceResult.data;
  if (eventsResult.isLoading) return <SpaceLoader space={space} isMember={isMember} />;
  if (!eventsResult.data)
    return <div>Could not find calendar events</div>;
  const events = eventsResult.data.map((event) => {
    return {
      id: event.id,
      title: event.title,
      start: event.startAt,
      end: event.endAt,
    }
  })

  return (
    <AppLayout>
      <Container size="md">
      <SpaceNavBar space={space} isMember={isMember}/>
      <div className={classes.area}>
        <Title order={2} className={classes.areaTitle}>Agenda</Title>
        <Calendar
        defaultView='agenda'
        events={events}
        localizer={localizer}
        onDoubleClickEvent={(event: {id: string}) => {
          void router.push(`/app/space/${space.id}/calendarEvent/${event.id}`)
        }}
        style={{ height: '100vh' }}
        />

      </div>
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
