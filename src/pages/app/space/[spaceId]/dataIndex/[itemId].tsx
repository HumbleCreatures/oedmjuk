import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import { Container, Text, Title, createStyles, Group, ThemeIcon, Button } from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from '../../../../../components/SpaceNavBar';
import { DataPointEditor } from '../../../../../components/DataPointEditor';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DateTime } from "luxon";
import { UserLinkWithData } from "../../../../../components/UserButton";
import { IconChartBar } from '@tabler/icons';
import Link from 'next/link';
import EditorJsRenderer from '../../../../../components/EditorJsRenderer';

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
  pointsText: {
    marginBottom: theme.spacing.md,
  },
}));


function DatIndexView({spaceId, itemId}: {spaceId: string, itemId: string}) {
  const { classes } = useStyles();
  const data = api.space.getSpace.useQuery({spaceId}).data;
  const dataIndexResult = api.dataIndex.getDataIndex.useQuery({itemId});
  const dataPointsResult = api.dataIndex.getDataPointsForIndex.useQuery({dataIndexId: itemId});
  if(!data || !data.space) return (<div>loading...</div>)
  if(dataIndexResult.isLoading) return (<div>loading...</div>)
  if(!dataIndexResult.data) return (<div>could not load item...</div>)
  if(dataPointsResult.isLoading) return (<div>loading...</div>)
  if(!dataPointsResult.data) return (<div>could not load item...</div>)

  const {space, isMember} = data;
  const {title, description, unitType, createdAt, updatedAt, creatorId} = dataIndexResult.data;
  
  return (
    <AppLayout>
      <Container size="sm">
      <SpaceNavBar space={space} isMember={isMember}/>
      <Container size="sm">
          <Title order={2} className={classes.mainTitle}>
            {title}
          </Title>
        </Container>

        <Container size="sm" className={classes.area}>
          <Group position="apart">
            <Title order={2} className={classes.areaTitle}>
              Data index
            </Title>
            <ThemeIcon size="xl">
              <IconChartBar />
            </ThemeIcon>
          </Group>
          <div>
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
            <Text fz="sm" fw={300}>
               Data index is measured in <Text fz="sm" fw={500} className={classes.inlineText}>{unitType.name} ({unitType.unitName})</Text>
            </Text>
          </div>
          <Link href={`/app/space/${spaceId}/dataIndex/${itemId}/edit`} passHref>
              <Button component="a">Edit</Button>
            </Link>
        </Container>

        {description && <Container size="sm" className={classes.bodyArea}>
      <EditorJsRenderer data={description} />
        </Container> }            
        
      

      {dataPointsResult.data && dataPointsResult.data.length > 0 && <Container size="sm" className={classes.bodyArea}>
        <Title order={3} className={classes.areaTitle}>
              Data Chart
        </Title>
        <div style={{ width: 500, height: 300}}>
          <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={dataPointsResult.data.map((dataPoint) => ({name: dataPoint.datestamp.toISOString().split('T')[0], value: dataPoint.value}))}
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
          <Bar dataKey="value" name={unitType.unitName} fill="#5b6c41" />
        </BarChart>
      </ResponsiveContainer>
      </div>
      </Container> }

      <Container size="sm" className={classes.area}>
        <Title order={4} className={classes.areaTitle}>Add Data points</Title>
        <DataPointEditor dataIndexId={itemId} />
      </Container>

      </Container>
    </AppLayout>
  );
} 
const LoadingDataIndexView: NextPage = () => {
  const router = useRouter()
  
  const { spaceId, itemId } = router.query;
  if(!spaceId || !itemId) return (<div>loading...</div>);

  return (
    <DatIndexView spaceId={spaceId as string} itemId={itemId as string} />
  );
};

export default LoadingDataIndexView;
