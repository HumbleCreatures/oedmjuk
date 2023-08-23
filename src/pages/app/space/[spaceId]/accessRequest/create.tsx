import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import { Container, TextInput, Title, createStyles, Text, Box, Select } from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from '../../../../../components/SpaceNavBar';
import { SpaceLoader } from '../../../../../components/Loaders/SpaceLoader';
import { forwardRef, useState } from 'react';
import EditorJsRenderer from '../../../../../components/EditorJsRenderer';
import { AccessRequestType } from '@prisma/client';
import { CreateAccessRequestForm } from '../../../../../components/CreateAccessRequestForm';

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
  }
}));

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
    value: string;
    label: string;
    description: string;
    data: AccessRequestType;
  }
  
  const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
    ({ label, description, ...others }: ItemProps, ref) => (
      <div ref={ref} {...others}>
            <Text size="sm">{label}</Text>
            <Text size="xs" opacity={0.65}>
            {description && <EditorJsRenderer data={description} />}
            </Text>
      </div>
    )
  );

  SelectItem.displayName = 'SelectItem';



function SpaceView({spaceId}: {spaceId: string}) {
  const { classes } = useStyles();
  const [selectedAccessRequestType, setSelectedAccessRequestType] = useState<AccessRequestType | null>(null);
  const spaceResult = api.space.getSpace.useQuery({ spaceId });
  const accessRequestTypesResult =
    api.accessRequest.getAllAccessRequestTypesForSpace.useQuery({ spaceId });


  if (spaceResult.isLoading) return <SpaceLoader />;
  
  if (!spaceResult.data)
    return <div>Could not find space</div>;
const { space, isMember } = spaceResult.data;
  if(accessRequestTypesResult.isLoading) return <SpaceLoader space={space} isMember={isMember} />;

  if(!accessRequestTypesResult.data) return <div>Could not find access request types</div>;
  

  const selectableAccessRequestTypes = accessRequestTypesResult.data?.map((accessRequestType) => ({
    value: accessRequestType.id,
    label: accessRequestType.name,
    description: accessRequestType.description,
  }));
  
  return (
    <AppLayout>
      <Container size="sm">
      <SpaceNavBar space={space} isMember={isMember}/>
      <Container size="sm" className={classes.area}>
        <Title className={classes.areaTitle} order={2}>Create a new content page</Title>
        <Select
            label="Choose what to access"
            placeholder="Pick one"
            itemComponent={SelectItem}
            data={selectableAccessRequestTypes}
            searchable
            maxDropdownHeight={400}
            nothingFound="Nobody here"
            onChange={(value) => {
                const selected = accessRequestTypesResult.data?.find((x) => x.id === value);
                if(selected) setSelectedAccessRequestType(selected);
            } }
            filter={(value, item) =>
              item.label ? item.label.toLowerCase().includes(value.toLowerCase().trim()) : false
                
            }
            />

            {selectedAccessRequestType && <CreateAccessRequestForm accessRequestType={selectedAccessRequestType} /> }
        
      </Container>

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
