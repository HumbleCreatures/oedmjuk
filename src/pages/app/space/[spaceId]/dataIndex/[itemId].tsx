import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import { Container, Text, Title } from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from '../../../../../components/SpaceNavBar';
import { DataPointEditor } from '../../../../../components/DataPointEditor';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';



function DatIndexView({spaceId, itemId}: {spaceId: string, itemId: string}) {
  const data = api.space.getSpace.useQuery({spaceId}).data;
  const dataIndexResult = api.dataIndex.getDataIndex.useQuery({itemId});
  const dataPointsResult = api.dataIndex.getDataPointForIndex.useQuery({dataIndexId: itemId});
  if(!data || !data.space) return (<div>loading...</div>)
  if(dataIndexResult.isLoading) return (<div>loading...</div>)
  if(!dataIndexResult.data) return (<div>could not load item...</div>)
  if(dataPointsResult.isLoading) return (<div>loading...</div>)
  if(!dataPointsResult.data) return (<div>could not load item...</div>)

  const {space, isMember} = data;
  const {title, description, unitType} = dataIndexResult.data;

  return (
    <AppLayout>
      <Container size="xs">
      <SpaceNavBar space={space} isMember={isMember}/>
        
        {dataIndexResult.isLoading &&
            <div>Loading...</div>
        }

{!dataIndexResult.isLoading && !dataIndexResult.data && <div>Content not found</div> }

            
            <><Text fz="lg" fw={500}>
                <Title order={2}>{title}</Title>
            </Text>
            <Text>
            <div dangerouslySetInnerHTML={{__html: description}} />
            <div>
               UnitType: {unitType.name} ({unitType.unitName})
            </div>
        </Text></>
            
        
      </Container>

      <Container size="xs">
        <Title order={4}>Add Data points</Title>
        <DataPointEditor dataIndexId={itemId} />
      </Container>

      <Container size="xs">
        <Text fz="lg" fw={500}>
          Data points
          </Text>
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
          <Bar dataKey="value" name={unitType.unitName} fill="#228be6" />
        </BarChart>
      </ResponsiveContainer>
      </div>
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
