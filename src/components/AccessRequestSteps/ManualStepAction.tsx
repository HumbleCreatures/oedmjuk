import { Button, Container, createStyles, Text, Title } from "@mantine/core";
import { api } from "../../utils/api";
import type { AccessRequest, AccessRequestStep } from "@prisma/client";
import EditorJsRenderer from "../EditorJsRenderer";

const useStyles = createStyles((theme) => ({
    area: {
      backgroundColor: theme.white,
      borderRadius: theme.radius.md,
      marginTop: theme.spacing.md,
      padding: 0,
    },

  }));
export function ManualStepAction({step, accessRequest}:{step: AccessRequestStep, accessRequest: AccessRequest}) {
    const {classes} = useStyles();
    const utils = api.useContext();
    const stepStatusResult = api.accessRequest.getStepStatusForUser.useQuery({
        stepId: step.id,
        accessRequestId: accessRequest.id,
    });
    const acceptMutation = api.accessRequest.markManualStepAsDone.useMutation({
        onSuccess() {
          void utils.accessRequest.getAccessRequest.invalidate({ itemId: accessRequest.id });
        },
      });

    const failedMutation = api.accessRequest.markManualStepAsFailure.useMutation({
    onSuccess() {
        void utils.accessRequest.getAccessRequest.invalidate({ itemId: accessRequest.id });
    },
    });

    if(stepStatusResult.isLoading) return <div>Loading...</div>;
    if(stepStatusResult.isError) return <div>Error...</div>;

    const {canInteract, hasTakenAction, stepExecutions } = stepStatusResult.data;
    const numberOfVerifications = stepExecutions ? stepExecutions.filter((execution) => execution.done).length : 0;

    return  <Container size="sm" className={classes.area}>
    <Title order={3}>{step.name}</Title>
    <Text>{numberOfVerifications} out of {step.manualAction} has been verified.</Text>
    <Text>{step.description && <EditorJsRenderer data={step.description} />}</Text>
    
    {canInteract && <div>
    <Button onClick={() => acceptMutation.mutate({stepId: step.id, accessRequestId: accessRequest.id}) }>Verify</Button>
    <Button onClick={() => failedMutation.mutate({stepId: step.id, accessRequestId: accessRequest.id, comment: "No comment"}) }>Failed</Button>
    </div>}

    {hasTakenAction && <div>You have already taken action. Thanks!</div>}
    </Container>
}