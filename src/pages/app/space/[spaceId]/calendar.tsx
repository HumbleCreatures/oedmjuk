import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../../components/AppLayout";
import { Container, Title, SimpleGrid, createStyles } from "@mantine/core";
import { api } from "../../../../utils/api";
import { SpaceNavBar } from '../../../../components/SpaceNavBar';
import { Calendar, luxonLocalizer, Event } from 'react-big-calendar'
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

function SpaceView({spaceId}: {spaceId: string}) {
  const router = useRouter();
  const { classes } = useStyles();
  

  const spaceRequest = api.space.getSpace.useQuery({spaceId});
  const eventsRequest = api.calendarEvents.getCalendarEventsForSpace.useQuery({spaceId});
  if(spaceRequest.isLoading || eventsRequest.isLoading) return (<div>loading...</div>);
  if(spaceRequest.error || eventsRequest.error) return (<div>error</div>);
  if(spaceRequest.data === undefined || eventsRequest.data === undefined) return (<div>not found</div>);
  const {space, isMember} = spaceRequest.data;
  const events = eventsRequest.data.map((event) => {
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
        <Title order={2} className={classes.areaTitle}>Calendar goes here</Title>
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
