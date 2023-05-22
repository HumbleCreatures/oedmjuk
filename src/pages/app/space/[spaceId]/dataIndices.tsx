import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../../components/AppLayout";
import { Container, Title, SimpleGrid, createStyles, Card, Text } from "@mantine/core";
import { api } from "../../../../utils/api";
import { SpaceNavBar } from '../../../../components/SpaceNavBar';
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { DateTime } from "luxon";
import Link from 'next/link';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const useStyles = createStyles((theme) => ({
  area: {
    backgroundColor: theme.colors.gray[4],
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  areaTitle: {
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.md,
  },
  inlineText: {
    display: "inline",
  }
}));

function SpaceView({spaceId}: {spaceId: string}) {
  const { classes } = useStyles();
  const spaceRequest = api.space.getSpace.useQuery({spaceId});
  const dataIndexRequest = api.dataIndex.getDataIndicesForSpace.useQuery({spaceId});
  if(spaceRequest.isLoading || dataIndexRequest.isLoading) return (<div>loading...</div>);
  if(spaceRequest.error || dataIndexRequest.error) return (<div>error</div>);
  if(spaceRequest.data === undefined || dataIndexRequest.data === undefined) return (<div>not found</div>);
  const {space, isMember} = spaceRequest.data;

  return (
    <AppLayout>
      <Container size="sm">
      <SpaceNavBar space={space} isMember={isMember}/>
      <div className={classes.area}>
        <Title order={2} className={classes.areaTitle}>Data Indices</Title>
        <SimpleGrid cols={1}>
            {dataIndexRequest.data.map((dataIndex) => (<Link href={`/app/space/${dataIndex.spaceId}/dataIndex/${dataIndex.id}`} key={dataIndex.id}>
              <Card>
                <Card.Section mt="md" inheritPadding py="xs">
            <Text fz="lg" fw={500}>{dataIndex.title}</Text>
            <div>

                  <Text fz="sm" fw={300}>
                    Created  <Text fz="sm" fw={500} className={classes.inlineText}>{DateTime.fromJSDate(dataIndex.createdAt)
                      .setLocale("en")
                      .toRelative()}</Text>
                  </Text>

                  {dataIndex.updatedAt && dataIndex.updatedAt.getTime() !== dataIndex.createdAt.getTime() && <Text fz="sm" fw={300}>
                    Last updated  <Text fz="sm" fw={500} className={classes.inlineText}>{DateTime.fromJSDate(dataIndex.updatedAt)
                      .setLocale("en")
                      .toRelative()}</Text>
                  </Text>}

                </div>
                </Card.Section>
                <Card.Section mt="md" inheritPadding py="xs" withBorder>
                <div style={{ width: 500, height: 300}}>
                <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={dataIndex.dataIndexPoints.map((dataPoint) => ({name: dataPoint.datestamp.toISOString().split('T')[0], value: dataPoint.value}))}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name={dataIndex.unitType.unitName} fill="#5b6c41" />
        </BarChart>
      </ResponsiveContainer></div>
                </Card.Section>

            </Card></Link>))}
        </SimpleGrid>


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
