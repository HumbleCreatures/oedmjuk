import { type NextPage } from "next";
import AppLayout from "../../../../components/AppLayout";
import { useForm } from "@mantine/form";
import { TextInput, Button, Container, Title, Alert, Text, createStyles, SimpleGrid } from "@mantine/core";
import { api } from "../../../../utils/api";
import { IconAlertCircle } from '@tabler/icons';
import { SettingsNavBar } from "../../../../components/SettingsNavBar";
import { SettingsLoader } from "../../../../components/Loaders/SettingsLoader";
import { DynamicBlockEditor } from "../../../../components/DynamicBlockEditor";
import { OutputData } from "@editorjs/editorjs";

import { useRouter } from "next/router";
import { useEffect } from "react";

const useStyles = createStyles((theme) => ({
  area: {
    backgroundColor: theme.colors.gray[4],
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  clearArea: {
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
    color: theme.white,
    padding: 0
  },
  editArea: {
    backgroundColor: theme.colors.gray[0],
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
  },
  areaTitle: {
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.md,
  },
  editorWrapper: {
    marginTop: theme.spacing.md,
  },
  fullWidth: {
    width: "100%",
  },
  listLinkItem: {
    borderRadius: theme.radius.md,
    boxShadow: theme.shadows.sm,
    backgroundColor: theme.white,
    padding: theme.spacing.md,
    color: theme.black,
    '&:hover': { 
      borderLeft: `0.5rem solid ${theme.colors.earth[2]}`,
      paddingLeft: '0.5rem', 
    }
  }
}));

const DatIndexTypeView = ({dataIndexTypeId }:{dataIndexTypeId: string}) => {
  const { classes } = useStyles();
  const form = useForm<{name: string, unitName: string, description: string | null}>({
    initialValues: {
        name: "",
        unitName: "",
        description: "",
    },
    validate: {
        name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null        
    },
  });

  const utils = api.useContext();
  const query = api.dataIndex.getIndexType.useQuery({dataIndexTypeId: dataIndexTypeId});
  const mutation = api.dataIndex.updateIndexType.useMutation({
    onSuccess() {
      void utils.dataIndex.getAllIndexTypes.invalidate();
    },
  });

  useEffect(() => {
    if (query.data) {
        form.setValues(query.data);
    }
   }, [query.data])

  if(query.isLoading) return (<SettingsLoader />);
  if(!query.data) return (<div>could not load types...</div>);



  return (
    <AppLayout>
      <Container size="sm">
      <SettingsNavBar />

      <Container size="sm" className={classes.editArea}>
        <Title className={classes.areaTitle} order={2}>Edit Data Index Type</Title>

        <form
          onSubmit={form.onSubmit((values) => {
            mutation.mutate({...values, dataIndexTypeId: dataIndexTypeId, description: values.description ? values.description : undefined});
          })}
        >
          <TextInput
            label="Name"
            placeholder="Name"
            {...form.getInputProps("name")}
          />
          <TextInput
            label="Unit Name"
            placeholder="Unit Name"
            {...form.getInputProps("unitName")}
          />
         <div className={classes.editorWrapper}>
          <Text fz="sm" fw={500}>Description</Text>
 <DynamicBlockEditor data={form.getInputProps('description').value ? JSON.parse(form.getInputProps('description').value as string) as OutputData : undefined} holder="blockeditor-container" onChange={(data:OutputData) => {
            form.setFieldValue('description', JSON.stringify(data))}}  />
              </div>
          <Button type="submit" mt="sm">
            Submit
          </Button>
            
          {mutation.error && 
           <Alert icon={<IconAlertCircle size={16} />} title="Bummer!" color="red">Something went wrong! {mutation.error.message}</Alert>}
        </form>
      </Container>
      </Container>
    </AppLayout>
  );
};

const LoadingDataIndexTypeView: NextPage = () => {
    const router = useRouter();
  
    const { dataIndexTypeId } = router.query;
    if (!dataIndexTypeId) return <div>loading...</div>;
  
    return <DatIndexTypeView dataIndexTypeId={dataIndexTypeId as string} />;
  };
  
  export default LoadingDataIndexTypeView;

