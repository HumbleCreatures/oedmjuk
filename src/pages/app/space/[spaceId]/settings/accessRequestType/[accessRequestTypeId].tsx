import { useRouter } from "next/router";
import { type NextPage } from "next";
import AppLayout from "../../../../../../components/AppLayout";
import {
  Alert,
  Button,
  Container,
  TextInput,
  Title,
  createStyles,
  Text,
  Switch,
  NumberInput,
} from "@mantine/core";
import { api } from "../../../../../../utils/api";
import { SpaceNavBar } from "../../../../../../components/SpaceNavBar";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons";
import { useEffect } from "react";
import { OutputData } from "@editorjs/editorjs";
import { DynamicBlockEditor } from "../../../../../../components/DynamicBlockEditor";
import { SpaceLoader } from "../../../../../../components/Loaders/SpaceLoader";
import { useGeneralStyles } from "../../../../../../styles/generalStyles";

import dynamic from "next/dynamic";

export const DynamicAccessRequestStepsEditor = dynamic(() => import("../../../../../../components/AccessRequestStepsEditor"), {
    ssr: false,
})

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
  },
  fullWidth: {
    width: "100%",
  },
}));

type FormType = {
  name: string;
  description: string | null;
  hasOnBehalfOfUser: boolean | null;
  onBehalfOfUserIsRequired: boolean | null;
  hasOnBehalfOfSpace: boolean | null;
  onBehalfOfSpaceIsRequired: boolean | null;
  minimumNumberOfApprovals: number | null;
};

function EditAccessRequestTypeView({
  spaceId,
  accessRequestTypeId,
}: {
  spaceId: string;
  accessRequestTypeId: string;
}) {
  const { classes } = useStyles();
  const { classes: generalClasses } = useGeneralStyles();

  const spaceResult = api.space.getSpace.useQuery({ spaceId });
  const accessRequestTypeQuery =
    api.accessRequest.getAccessRequestType.useQuery({
      accessRequestTypeId: accessRequestTypeId,
    });

  const form = useForm<FormType>({
    initialValues: {
      name: accessRequestTypeQuery.data?.name || "",
      description: accessRequestTypeQuery.data?.description || "",
      hasOnBehalfOfUser:
        accessRequestTypeQuery.data?.hasOnBehalfOfUser || false,
      onBehalfOfUserIsRequired:
        accessRequestTypeQuery.data?.onBehalfOfUserIsRequired || false,
      hasOnBehalfOfSpace:
        accessRequestTypeQuery.data?.hasOnBehalfOfSpace || false,
      onBehalfOfSpaceIsRequired:
        accessRequestTypeQuery.data?.onBehalfOfSpaceIsRequired || false,
      minimumNumberOfApprovals:
        accessRequestTypeQuery.data?.minimumNumberOfApprovals || 0,
    },
    validate: {
      name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
    },
  });
  const utils = api.useContext();
  const mutation = api.accessRequest.updateAccessRequestType.useMutation({
    onSuccess(data) {
      void utils.accessRequest.getAllAccessRequestTypesForSpace.invalidate({
        spaceId,
      });
    },
  });


  useEffect(() => {
    if (accessRequestTypeQuery.data) {
      form.setValues(accessRequestTypeQuery.data);
    }
  }, [accessRequestTypeQuery.data]);

  if (spaceResult.isLoading) return <SpaceLoader />;
  if (!spaceResult.data) return <div>Did not find space.</div>;
  if (accessRequestTypeQuery.isLoading)
    return (
      <SpaceLoader
        space={spaceResult.data?.space}
        isMember={spaceResult.data?.isMember}
      />
    );
  if (!accessRequestTypeQuery.data)
    return <div>Did not find calendar event.</div>;
  const { space, isMember } = spaceResult.data;

  return (
    <AppLayout>
      <Container size="sm">
        <SpaceNavBar space={space} isMember={isMember} />
        <Container size="sm" className={classes.area}>
          <Title className={classes.areaTitle} order={2}>
            Edit access request type
          </Title>

          <form
            onSubmit={form.onSubmit((values) => {
              mutation.mutate({
                ...values,
                accessRequestTypeId,
                description: values.description || "",
                hasOnBehalfOfUser: values.hasOnBehalfOfUser || false,
                onBehalfOfUserIsRequired:
                  values.onBehalfOfUserIsRequired || false,
                hasOnBehalfOfSpace: values.hasOnBehalfOfSpace || false,
                onBehalfOfSpaceIsRequired:
                  values.onBehalfOfSpaceIsRequired || false,
                minimumNumberOfApprovals: values.minimumNumberOfApprovals || 0,
              });
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
                checked={!!form.values.hasOnBehalfOfUser}
              />
            </div>
            <div className={generalClasses.switchContainer}>
              <Switch
                label="Behalf of user is required?"
                {...form.getInputProps("onBehalfOfUserIsRequired")}
                checked={!!form.values.onBehalfOfUserIsRequired}
              />
            </div>
            <div className={generalClasses.switchContainer}>
              <Switch
                label="Has behalf of space?"
                {...form.getInputProps("hasOnBehalfOfSpace")}
                checked={!!form.values.hasOnBehalfOfSpace}
              />
            </div>
            <div className={generalClasses.switchContainer}>
              <Switch
                label="Behalf of space is required?"
                {...form.getInputProps("onBehalfOfSpaceIsRequired")}
                checked={!!form.values.onBehalfOfSpaceIsRequired}
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
              holder="blockeditor-container"
              data={accessRequestTypeQuery.data.description ? JSON.parse(accessRequestTypeQuery.data.description) as OutputData : undefined}
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
        <DynamicAccessRequestStepsEditor accessRequestType={accessRequestTypeQuery.data} />
      </Container>
    </AppLayout>
  );
}
const LoadedEditAccessRequestTypeView: NextPage = () => {
  const router = useRouter();

  const { spaceId, accessRequestTypeId } = router.query;
  if (!spaceId || !accessRequestTypeId) return <div>loading...</div>;
  

  return (
    <EditAccessRequestTypeView
      spaceId={spaceId as string}
      accessRequestTypeId={accessRequestTypeId as string}
    />
  );
};

export default LoadedEditAccessRequestTypeView;
