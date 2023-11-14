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
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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

const TemplateView = ({templateId}:{templateId: string}) => {
  const { classes } = useStyles();
  const form = useForm<{name: string, body: string}>({
    initialValues: {
      name: "",
      body: "",
    },
    validate: {
        name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null        
    },
  });

  const utils = api.useContext();
  const query = api.bodyTemplate.getTemplate.useQuery({templateId});
  const mutation = api.bodyTemplate.updateTemplate.useMutation({
    onSuccess() {
      void utils.bodyTemplate.getAllTemplates.invalidate();
    },
  });

  useEffect(() => {
    if (query.data) {
        const currentVersion = query.data.bodyTemplateVersions.find((v) => v.isCurrentVersion);
        if(currentVersion) {
            form.setValues({name: currentVersion.name, body: currentVersion.body });
        }
    }
   }, [query.data])

  if(query.isLoading) return (<SettingsLoader />);
  if(!query.data) return (<div>could not load types...</div>);



  return (
    <AppLayout>
      <Container size="sm">
      <SettingsNavBar />

      <Container size="sm" className={classes.editArea}>
        <Title className={classes.areaTitle} order={2}>Edit Template</Title>

        <form
          onSubmit={form.onSubmit((values) => {
            mutation.mutate({...values, templateId});
          })}
        >
          <TextInput
            label="Name"
            placeholder="Name"
            {...form.getInputProps("name")}
          />
         <div className={classes.editorWrapper}>
          <Text fz="sm" fw={500}>Template Body</Text>

              
              <DynamicBlockEditor data={form.getInputProps('body').value ? JSON.parse(form.getInputProps('body').value as string) as OutputData : undefined} holder="template-blockeditor-container" onChange={(data:OutputData) => {
            form.setFieldValue('body', JSON.stringify(data))}}  />
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

const LoadingSpaceView: NextPage = () => {
    const router = useRouter();
  
    const { templateId } = router.query;
    if (!templateId) return <div>loading...</div>;
  
    return <TemplateView templateId={templateId as string} />;
  };
  
  export default LoadingSpaceView;

