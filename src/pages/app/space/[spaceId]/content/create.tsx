import { useRouter } from 'next/router'
import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import { Alert, Button, Container, TextInput, Title, createStyles, Text, Box } from "@mantine/core";
import { api } from "../../../../../utils/api";
import { SpaceNavBar } from '../../../../../components/SpaceNavBar';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons';
import { DynamicTemplatedBlockEditor } from '../../../../../components/DynamicTemplatedBlockEditor';
import type { OutputData } from '@editorjs/editorjs';
import { SpaceLoader } from '../../../../../components/Loaders/SpaceLoader';

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


function SpaceView({spaceId}: {spaceId: string}) {
  const { classes } = useStyles();
  const spaceResult = api.space.getSpace.useQuery({ spaceId });
  const form = useForm({
    initialValues: {
      title: "",
      body: "",
    },
    validate: {
      title: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
    },
  });
  const utils = api.useContext();
  const mutation = api.content.createContent.useMutation({
    onSuccess(data) {
      void utils.space.getSpace.invalidate();
      void router.push(`/app/space/${spaceId}/content/${data.id}`);
    },
  });

  const router = useRouter();

  if (spaceResult.isLoading) return <SpaceLoader />;
  
  if (!spaceResult.data)
    return <div>Could not find space</div>;

  const { space, isMember } = spaceResult.data;

  
  return (
    <AppLayout>
      <Container size="sm">
      <SpaceNavBar space={space} isMember={isMember}/>
      <Container size="sm" className={classes.area}>
        <Title className={classes.areaTitle} order={2}>Create a new content page</Title>

        <form
          onSubmit={form.onSubmit((values) => {
            mutation.mutate({...values, spaceId: space.id});
          })}
        >
          <Box mb="sm">
          <TextInput
            label="Title"
            placeholder="Title"
            {...form.getInputProps("title")}
          />
          <div className={classes.editorWrapper}>
          <Text fz="sm" fw={500}>Body</Text>
          <DynamicTemplatedBlockEditor holder="blockeditor-container" onChange={(data:OutputData) => {
            form.setFieldValue('body', JSON.stringify(data))}}  />
          </div>
          </Box>

          <Button type="submit" mt="sm">
            Create
          </Button>
            
          {mutation.error && 
           <Alert icon={<IconAlertCircle size={16} />} title="Bummer!" color="red">Something went wrong! {mutation.error.message}</Alert>}
        </form>
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
