import { type NextPage } from "next";
import AppLayout from "../../../../../components/AppLayout";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Button,
  Container,
  Title,
  Alert,
  Text,
  createStyles,
  Switch,
  SimpleGrid,
  NumberInput,
} from "@mantine/core";
import { api } from "../../../../../utils/api";
import { IconAlertCircle } from "@tabler/icons";
import { DynamicBlockEditor } from "../../../../../components/DynamicBlockEditor";
import type { OutputData } from "@editorjs/editorjs";
import { useGeneralStyles } from "../../../../../styles/generalStyles";
import Link from "next/link";
import { SpaceLoader } from "../../../../../components/Loaders/SpaceLoader";
import { useRouter } from "next/router";
import { SpaceNavBar } from "../../../../../components/SpaceNavBar";
import EditorJsRenderer from "../../../../../components/EditorJsRenderer";
import { useState } from "react";
import { ClearTriggerValues } from "../../../../../components/BlockEditor";

const useStyles = createStyles((theme) => ({
  area: {
    backgroundColor: theme.colors.gray[4],
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  editArea: {
    backgroundColor: theme.colors.gray[0],
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  areaTitle: {
    fontSize: theme.fontSizes.md,
  },
  editorWrapper: {
    marginTop: theme.spacing.md,
  },
  fullWidth: {
    width: "100%",
  },
  listItemText: {
    fontSize: theme.fontSizes.md,
    fontWeight: 500,
    paddingLeft: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  }
}));

const RequestAccessTypesPage = ({ spaceId }: { spaceId: string }) => {
  const { classes } = useStyles();
  const { classes: generalClasses } = useGeneralStyles();
  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      hasOnBehalfOfUser: false,
      onBehalfOfUserIsRequired: false,
      hasOnBehalfOfSpace: false,
      onBehalfOfSpaceIsRequired: false,
      minimumNumberOfApprovals: 0,
    },
    validate: {
      name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
    },
  });
  const [clearTrigger, setClearTrigger] = useState<ClearTriggerValues>();
  const utils = api.useContext();
  const mutation = api.accessRequest.createAccessRequestType.useMutation({
    onSuccess() {
      void utils.accessRequest.getAllAccessRequestTypesForSpace.invalidate({
        spaceId,
      });
    },
  });
  const spaceResult = api.space.getSpace.useQuery({ spaceId });
  const accessRequestTypesResult =
    api.accessRequest.getAllAccessRequestTypesForSpace.useQuery({ spaceId });
  if (spaceResult.isLoading) return <SpaceLoader />;
  if (!spaceResult.data) return <div>Could not find space</div>;
  const { space, isMember } = spaceResult.data;
  if (accessRequestTypesResult.isLoading)
    return <SpaceLoader space={space} isMember={isMember} />;
  if (!accessRequestTypesResult.data)
    return <div>Could not find space request types</div>;

  return (
    <AppLayout>
      <Container size="sm">
        <SpaceNavBar space={space} isMember={isMember} />

        <Container size="sm" className={generalClasses.clearArea}>
          <div className={generalClasses.listHeader}>
            <Title className={classes.areaTitle} order={2}>
              Access Request Types
            </Title>
          </div>
          <SimpleGrid cols={1} spacing="xs">
            {accessRequestTypesResult.data.map((requestType) => {
              return (
                <Link
                  className={generalClasses.listLinkItem}
                  key={requestType.id}
                  href={`/app/space/${spaceId}/settings/accessRequestType/${requestType.id}`}
                >
                  <Text className={classes.listItemText}>
                    {requestType.name}
                  </Text>
                  {requestType.description && (
                    <EditorJsRenderer data={requestType.description} />
                  )}
                </Link>
              );
            })}
          </SimpleGrid>
        </Container>
        <Container size="sm" className={classes.editArea}>
          <Title order={1} className={classes.areaTitle}>
            Create a access request type
          </Title>

          <form
            onSubmit={form.onSubmit((values) => {
              mutation.mutate({ ...values, spaceId });
              form.reset();
              setClearTrigger(clearTrigger === ClearTriggerValues.clear ? ClearTriggerValues.clearAgain : ClearTriggerValues.clear); 
            })}
          >
            <TextInput
              label="Name"
              placeholder="Name"
              {...form.getInputProps("name")}
            />
            <div className={generalClasses.switchContainer}> 
            <Switch
              label="Has behalf of user?"
              {...form.getInputProps("hasOnBehalfOfUser")}
              checked={form.values.hasOnBehalfOfUser}
            /></div>
            <div className={generalClasses.switchContainer}>
            <Switch
              label="Behalf of user is required?"
              {...form.getInputProps("onBehalfOfUserIsRequired")}
              checked={form.values.onBehalfOfUserIsRequired}
            /></div>
            <div className={generalClasses.switchContainer}>
            <Switch
              label="Has behalf of space?"
              {...form.getInputProps("hasOnBehalfOfSpace")}
              checked={form.values.hasOnBehalfOfSpace}
            /></div>
            <div className={generalClasses.switchContainer}>
            <Switch
              label="Behalf of space is required?"
              {...form.getInputProps("onBehalfOfSpaceIsRequired")}
              checked={form.values.onBehalfOfSpaceIsRequired}
            />
            </div>

            <NumberInput
              defaultValue={0}
              placeholder="Minimum number of approvals"
              label="Minimum number of approvals"
              {...form.getInputProps("minimumNumberOfApprovals")}
            />

            <Text fz="sm" fw={500}>
              Description
            </Text>
            <DynamicBlockEditor
                clearTrigger={clearTrigger} 
              holder="blockeditor-container"
              onChange={(data: OutputData) => {
                form.setFieldValue("description", JSON.stringify(data));
              }}
            />
            <Button type="submit" mt="sm">
              Submit
            </Button>

            {mutation.error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Bummer!"
                color="red"
              >
                Something went wrong! {mutation.error.message}
              </Alert>
            )}
          </form>
        </Container>
      </Container>
    </AppLayout>
  );
};

const LoadingRequestAccessTypesPage: NextPage = () => {
  const router = useRouter();

  const { spaceId } = router.query;
  if (!spaceId) return <div>loading...</div>;

  return <RequestAccessTypesPage spaceId={spaceId as string} />;
};

export default LoadingRequestAccessTypesPage;
