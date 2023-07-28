import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../../components/AppLayout";
import { Container, Title, SimpleGrid, createStyles, Card, Text, Group } from "@mantine/core";
import { api } from "../../../../utils/api";
import { SpaceNavBar } from '../../../../components/SpaceNavBar';
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { DateTime } from "luxon";
import Link from 'next/link';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SpaceLoader } from '../../../../components/Loaders/SpaceLoader';
import { useGeneralStyles } from '../../../../styles/generalStyles';
import { IconChartBar } from '@tabler/icons';

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
  },
  title: {
    fontSize: theme.fontSizes.md,
  },
  topGroup: {
    alignItems: "flex-start",
  }
}));

function SpaceView({spaceId}: {spaceId: string}) {
  const { classes } = useStyles();
  const { classes: generalClasses } = useGeneralStyles();

  const spaceResult = api.space.getSpace.useQuery({spaceId});
  const dataIndexResult = api.dataIndex.getDataIndicesForSpace.useQuery({spaceId});
  if (spaceResult.isLoading) return <SpaceLoader />;
  if (!spaceResult.data) return <div>Could not load space</div>;
  const { space, isMember } = spaceResult.data;
  
  if (dataIndexResult.isLoading) return <SpaceLoader space={space} isMember={isMember} />;
  if (!dataIndexResult.data) return <div>Could not load data index</div>;

  return (
    <AppLayout>
      <Container size="sm">
      <SpaceNavBar space={space} isMember={isMember}/>
      <Container size="sm" className={generalClasses.clearArea}>
        <Group className={generalClasses.listHeader}>
        
        <IconChartBar />
        <Title order={2} className={classes.title}>Data indices</Title>
        </Group>
        </Container>
    
        <SimpleGrid cols={1}>
            {dataIndexResult.data.map(({dataIndex, dataIndexPoints}) => (<Link href={`/app/space/${dataIndex.spaceId}/dataIndex/${dataIndex.id}`} key={dataIndex.id} className={generalClasses.listLinkItem}>
              <Card>
                <Card.Section mt="md" inheritPadding py="xs">
                  <Group position="apart" className={classes.topGroup}>
            <div>
            <Text fz="lg" fw={500}>{dataIndex.title}</Text>
            <div>
                  <Text fz="sm" fw={300}>
                    Measured in  <Text fz="sm" fw={500} className={classes.inlineText}>
                      {dataIndex.unitType.unitName}
                      </Text>
                  </Text>
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
                </div>


                <div style={{ width: 350, height: 150}}>
                <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={dataIndexPoints.map((dataPoint) => ({name: dataPoint.datestamp.toISOString().split('T')[0], value: dataPoint.value}))}
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
          <Bar dataKey="value" name={dataIndex.unitType.unitName} fill="#5b6c41" />
        </BarChart>
      </ResponsiveContainer></div>
      </Group>
                </Card.Section>

            </Card></Link>))}
        </SimpleGrid>


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
