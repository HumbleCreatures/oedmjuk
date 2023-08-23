import { useForm } from "@mantine/form";
import {
  TextInput,
  Button,
  Container,
  Title,
  Alert,
  Text,
  createStyles,
  SimpleGrid,
  NumberInput,
  List,
  ThemeIcon,
  Group,
  Select  
} from "@mantine/core";
import { api } from "../utils/api";
import { IconAlertCircle, IconChevronRight } from "@tabler/icons";
import { DynamicBlockEditor } from "./DynamicBlockEditor";
import type { OutputData } from "@editorjs/editorjs";
import { useGeneralStyles } from "../styles/generalStyles";
import EditorJsRenderer from "./EditorJsRenderer";
import { forwardRef, useState } from "react";
import { ClearTriggerValues } from "./BlockEditor";
import { AccessRequestType } from "@prisma/client";
import { AccessRequestStepTypes } from "../utils/enums";
 

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
  listItemTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: 500,
  }
}));

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  value: string;
  label: string;
  description: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ label, description, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
          <Text size="sm" weight={500}>{label}</Text>
          <div>
          <Text size="xs" opacity={0.65}>
          {description}
          </Text></div>
    </div>
  )
);

SelectItem.displayName = "StepTypeSelector"

const stepTypeList = [
  {
    value: "",
    label: "Select step type",
    description: "Choose a step type of your liking.",
  },
  {
  value: AccessRequestStepTypes.JoinSpace,
  label: "Join space",
  description: "Behalf of user will join this space. If behalf of user is not set the requesting user will be set as behalf of.",
},
{
  value: AccessRequestStepTypes.Manual,
  label: "Manual action",
  description: "Members of the spaces needs to execute a manual action and then go in and mark it as done. Can be multiple members.",
},
{
  value: AccessRequestStepTypes.OnBehalfOfUserApproval,
  label: "On behalf of user approval",
  description: "The user set as on behalf of needs approve this step.",
},
{
  value: AccessRequestStepTypes.RequesterApproval,
  label: "Requester approval",
  description: "Requester needs to approve this step.",
},
{
  value: AccessRequestStepTypes.OnBehalfOfSpaceApproval,
  label: "On behalf of space approval",
  description: "A number of members of the on behalf of space need to approve this step.",
}
]

type FormType = {
      name: string,
      description: string,
      manualAction: number,
      approvalFromOnBehalfOfSpace: number,
      stepType: AccessRequestStepTypes | undefined,
}
export const AccessRequestStepsEditor = ({ accessRequestType }: { accessRequestType: AccessRequestType }) => {
  const { classes } = useStyles();
  const { classes: generalClasses } = useGeneralStyles();
  const form = useForm<FormType>({
    initialValues: {
      name: "",
      description: "",
      manualAction: 1,
      approvalFromOnBehalfOfSpace: 1,
      stepType: undefined
    },
    validate: {
      name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
      stepType: (value) => 
        value === undefined ? "Step type need to be selected" : null,
    },
  });
  const [clearTrigger, setClearTrigger] = useState<ClearTriggerValues>();
  const utils = api.useContext();
  const createMutation = api.accessRequest.createAccessRequestStep.useMutation({
    onSuccess() {
      void utils.accessRequest.getAllAccessRequestStepsForType.invalidate({
        accessRequestTypeId: accessRequestType.id,
      });
    },
  });

  const deleteMutation = api.accessRequest.deleteAccessRequestStep.useMutation({
    onSuccess() {
      void utils.accessRequest.getAllAccessRequestStepsForType.invalidate({
        accessRequestTypeId: accessRequestType.id,
      });
    },
  });

  const accessRequestStepsResult =
    api.accessRequest.getAllAccessRequestStepsForType.useQuery({ 
      accessRequestTypeId: accessRequestType.id,
     });

  if (accessRequestStepsResult.isLoading)
    return <>Loading</>;
  if (!accessRequestStepsResult.data)
    return <div>Could not find space request steps</div>;

  return (

      <Container size="sm">

        <Container size="sm" className={generalClasses.clearArea}>
          <div className={generalClasses.listHeader}>
            <Title className={classes.areaTitle} order={2}>
              Access Request Steps
            </Title>
          </div>
          <SimpleGrid cols={1} spacing="xs">
            {accessRequestStepsResult.data.map((requestStep) => {
              return (
                <div
                  className={generalClasses.listItem}
                  key={requestStep.id}
                >
                  <Group position="apart"><Text className={classes.listItemTitle}>
                    {requestStep.name}
                  </Text>
                  <Button onClick={() => deleteMutation.mutate({accessRequestStepId: requestStep.id})}>Delete</Button>
                  </Group>
                  {requestStep.description && (
                    <EditorJsRenderer data={requestStep.description} />
                  )}

                  <List
                        spacing="xs"
                        size="sm"
                        center
                        icon={
                          <ThemeIcon color="teal" size={24} radius="xl">
                            <IconChevronRight size="1rem" />
                          </ThemeIcon>
                        }
                      >
                  {requestStep.stepType === AccessRequestStepTypes.JoinSpace && <List.Item> User selected in behalf of will join the space. This is an automated step.</List.Item>}
                  {requestStep.stepType === AccessRequestStepTypes.Manual && <List.Item> {requestStep.manualAction} member of the space needs to do manual actions.</List.Item>}
                  {requestStep.stepType === AccessRequestStepTypes.RequesterApproval && <List.Item>Requester needs to approve this step.</List.Item>}
                  {requestStep.stepType === AccessRequestStepTypes.OnBehalfOfUserApproval && <List.Item>User selected in behalf of needs to approve this step.</List.Item>}
                  {requestStep.stepType === AccessRequestStepTypes.OnBehalfOfSpaceApproval && <List.Item> {requestStep.approvalFromOnBehalfOfSpace} member of the behalf of space needs to approve this step.</List.Item>}
                  </List>
                </div>
              );
            })}
          </SimpleGrid>
        </Container>
        <Container size="sm" className={classes.editArea}>
          <Title order={1} className={classes.areaTitle}>
            Create a access request step
          </Title>

          <form
            onSubmit={form.onSubmit((values) => {
              if(values.stepType === undefined) {
                console.log("Step Type must be selected");
                return;
              }
              createMutation.mutate({ ...values, accessRequestTypeId: accessRequestType.id, stepType: values.stepType ? values.stepType : AccessRequestStepTypes.Manual });
              form.reset();
              setClearTrigger(clearTrigger === ClearTriggerValues.clear ? ClearTriggerValues.clearAgain : ClearTriggerValues.clear); 
            })}
          >
            <Select
            label="Select step type"
            placeholder="Pick one"
            itemComponent={SelectItem}
            data={stepTypeList}
            searchable
            maxDropdownHeight={400}
            nothingFound="Nobody here"
            value={form.values.stepType}
            onChange={(value) => {
                form.setValues({stepType: value as AccessRequestStepTypes})
            } }
            />
            {form.values.stepType !== undefined && 
            <>
            <TextInput
              label="Name"
              placeholder="Name"
              {...form.getInputProps("name")}
            />


            {form.values.stepType === AccessRequestStepTypes.Manual && <NumberInput
              defaultValue={1}
              min={1}
              placeholder="Number of members that needs to do manual actions"
              label="Number of members that needs to do manual actions"
              {...form.getInputProps("manualAction")}
            />}
            
            {form.values.stepType === AccessRequestStepTypes.OnBehalfOfSpaceApproval && <NumberInput
              defaultValue={1}
              min={1}
              placeholder="Number of member from behalf of space that needs to approve?"
              label="Number of member from behalf of space that needs to approve?"
              {...form.getInputProps("approvalFromOnBehalfOfSpace")}
            />}

            <Text fz="sm" fw={500}>
              Description
            </Text>
            <DynamicBlockEditor
                clearTrigger={clearTrigger} 
              holder="step-blockeditor-container"
              onChange={(data: OutputData) => {
                form.setFieldValue("description", JSON.stringify(data));
              }}
            />
            <Button type="submit" mt="sm">
              Submit
            </Button></>}

            {createMutation.error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Bummer!"
                color="red"
              >
                Something went wrong! {createMutation.error.message}
              </Alert>
            )}
          </form>
        </Container>
      </Container>
  );
};

export default AccessRequestStepsEditor;


  
