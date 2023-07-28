import { DatePickerInput } from "@mantine/dates";
import { NumberInput, Alert, Button, Group, createStyles } from "@mantine/core";

import { IconCalendar } from "@tabler/icons-react";

import { useForm } from "@mantine/form";
import { api } from "../utils/api";
import { IconAlertCircle } from "@tabler/icons";

interface InputValues {
  datestamp: Date | undefined;
  value: number | undefined;
}

const useStyles = createStyles((theme) => ({
  bottomGroup: {
    alignItems: "flex-end",
  },
}));

export function DataPointEditor({ dataIndexId }: { dataIndexId: string }) {
  const { classes } = useStyles();  
  const utils = api.useContext();
    const mutation = api.dataIndex.upsertDataIndexPoint.useMutation({
        onSuccess() {
          void utils.dataIndex.getDataIndex.invalidate({itemId: dataIndexId});
          void utils.dataIndex.getDataPointsForIndex.invalidate({dataIndexId: dataIndexId});
        },
      });

  const form = useForm<InputValues>({
    initialValues: {
      datestamp: undefined,
      value: undefined,
    },
    validate: {
      datestamp: (value) =>
        value === undefined ? "You have to enter a date." : null,
      value: (value) =>
        value === undefined ? "You have to enter a value" : null,
    },
  });

  return (
    
    <form
    onSubmit={form.onSubmit((values) => {
      console.log(values);
      if(!values.datestamp || !values.value) 
      return;
      mutation.mutate({datestamp: values.datestamp, value: values.value, dataIndexId: dataIndexId});
    })}
  >
    <Group position="apart" grow className={classes.bottomGroup}>
      <DatePickerInput
        icon={<IconCalendar size="1.1rem" stroke={1.5} />}
        label="Pick date"
        placeholder="Pick date"
        {...form.getInputProps("datestamp")}
      />

      <NumberInput
        label="Value for the chosen date"
        placeholder="0"
        {...form.getInputProps("value")}
      />
      <Button type="submit" mt="sm">
            Add point
          </Button>
         

     {mutation.error && 
           <Alert icon={<IconAlertCircle size={16} />} title="Bummer!" color="red">Something went wrong! {mutation.error.message}</Alert>}
        </Group>
        </form>
  );
}
